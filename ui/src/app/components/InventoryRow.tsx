import { useEffect, useState, useRef } from "react";
import { useContracts } from "../hooks/useContracts";
import { useAdventurer } from "../context/AdventurerProvider";
import { NullAdventurer } from "../types";
import { useTransactionCart } from "../context/TransactionCartProvider";
import { Button } from "./Button";

interface InventoryRowProps {
  title: string;
  items: any[];
  menuIndex: number;
  isActive: boolean;
  setActiveMenu: (value: any) => void;
  isSelected: boolean;
  setSelected: (value: any) => void;
  equippedItemId: number | undefined;
}

export const InventoryRow = ({
  title,
  items,
  menuIndex,
  isActive,
  setActiveMenu,
  isSelected,
  setSelected,
  equippedItemId,
}: InventoryRowProps) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { adventurerContract } = useContracts();
  const { adventurer } = useAdventurer();
  const { addToCalls } = useTransactionCart();
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const formatAdventurer = adventurer ? adventurer.adventurer : NullAdventurer;

  const ItemDisplay = (item: any) => {
    const formatItem = item.item;
    return (
      <div className="flex flex-row gap-2">
        <p className="whitespace-nowrap">
          {formatItem ? formatItem.item : "Nothing"}
        </p>
        <p className="whitespace-nowrap">
          {formatItem &&
            `[Rank ${formatItem.rank}, Greatness ${formatItem.greatness}, ${formatItem.xp} XP]`}
        </p>
      </div>
    );
  };

  const handleAddEquipItem = (itemId: any) => {
    if (adventurerContract) {
      const equipItem = {
        contractAddress: adventurerContract?.address,
        selector: "equip_item",
        calldata: [formatAdventurer?.id, "0", itemId, "0"],
        metadata: `Equipping ${itemId}!`,
      };
      addToCalls(equipItem);
    }
  };

  const unequippedItems = items?.filter((item) => item.id != equippedItemId);

  const handleKeyDown = (event: KeyboardEvent) => {
    switch (event.key) {
      case "ArrowDown":
        setSelectedIndex((prev) => {
          const newIndex = Math.min(prev + 1, unequippedItems?.length - 1);
          return newIndex;
        });
        break;
      case "ArrowUp":
        setSelectedIndex((prev) => {
          const newIndex = Math.max(prev - 1, 0);
          return newIndex;
        });
        break;
      case "Enter":
        handleAddEquipItem(unequippedItems[selectedIndex]?.id);
        break;
      case "Escape":
        setActiveMenu(undefined);
        break;
    }
  };

  useEffect(() => {
    if (isActive) {
      window.addEventListener("keydown", handleKeyDown);
    } else {
      window.removeEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isActive, selectedIndex]);

  return (
    <>
      <div className="flex flex-row gap-3 w-full align-center">
        <Button
          className={isSelected && !isActive ? "animate-pulse" : ""}
          variant={isSelected ? "default" : "ghost"}
          onClick={() => {
            setSelected(menuIndex);
            setActiveMenu(menuIndex);
          }}
        >
          <p className="text-xl w-40 whitespace-nowrap">{title}</p>
        </Button>
        <ItemDisplay
          item={items?.find((item: any) => item.id == equippedItemId)}
        />
      </div>
      <div className="absolute top-1/3 left-2/3 flex flex-col gap-4 w-full overflow-auto">
        {isSelected && unequippedItems?.length > 0 ? (
          <>
            <p>Equip:</p>
            {unequippedItems.map((item: any, index: number) => (
              <>
                <div key={index} className="flex flex-row items-center">
                  <ItemDisplay item={item} />
                  <Button
                    key={index}
                    ref={(ref) => (buttonRefs.current[index] = ref)}
                    className={
                      selectedIndex === index && isSelected
                        ? item.equippedAdventurerId
                          ? "animate-pulse bg-white"
                          : "animate-pulse"
                        : "h-[20px]"
                    }
                    variant={selectedIndex === index ? "subtle" : "outline"}
                    size={"xs"}
                    onClick={() => {
                      setSelectedIndex(index);
                      handleAddEquipItem(items[selectedIndex].id);
                    }}
                  >
                    Equip
                  </Button>
                </div>
              </>
            ))}
          </>
        ) : null}
      </div>
    </>
  );
};
