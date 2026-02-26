import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../../utils/api";
import { ChevronDown, Search, X, Package } from "lucide-react";

interface InventoryItem {
  _id: string;
  fabricName: string;
  color: string;
  gsm: number;
  availableMeters: number;
}

interface Props {
  value: string;
  onSelect: (inventory: InventoryItem) => void;
  error?: string;
  disabled?: boolean;
}

const fetchAllInventory = async () => {
  const res = await api.get(`/api/inventory?limit=1000`);
  return res?.data?.data?.inventory || [];
};

const FabricAutocomplete = ({ value, onSelect, error, disabled }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(value || "");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch inventory
  const { data: inventoryList = [], isLoading } = useQuery<InventoryItem[]>({
    queryKey: ["inventory-all"],
    queryFn: fetchAllInventory,
    staleTime: 1000 * 60 * 5,
  });

  // Filter inventory based on search (search in fabric name, color, and GSM)
  const filteredInventory = inventoryList.filter((item) => {
    const searchLower = debouncedSearch.toLowerCase();
    return (
      item.fabricName.toLowerCase().includes(searchLower) ||
      item.color.toLowerCase().includes(searchLower) ||
      item.gsm.toString().includes(searchLower)
    );
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (item: InventoryItem) => {
    setSearchTerm(item.fabricName);
    onSelect(item);
    setIsOpen(false);
  };

  const handleClear = () => {
    setSearchTerm("");
    setIsOpen(false);
  };

  // Update search term when value prop changes
  useEffect(() => {
    if (value !== searchTerm) {
      setSearchTerm(value);
    }
  }, [value]);

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-sm font-semibold text-slate-700 mb-2">
        Select Fabric from Inventory <span className="text-red-500">*</span>
      </label>

      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"
          size={18}
        />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          disabled={disabled}
          placeholder="Search by fabric name, color, or GSM..."
          className={`w-full pl-10 pr-20 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1c6bf2] disabled:bg-gray-100 disabled:cursor-not-allowed ${
            error ? "border-red-500" : "border-slate-300"
          }`}
        />

        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
          {searchTerm && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 hover:bg-slate-100 rounded transition-colors"
            >
              <X size={16} className="text-slate-400" />
            </button>
          )}
          <button
            type="button"
            onClick={() => !disabled && setIsOpen(!isOpen)}
            disabled={disabled}
            className="p-1 hover:bg-slate-100 rounded transition-colors disabled:cursor-not-allowed"
          >
            <ChevronDown
              size={18}
              className={`text-slate-400 transition-transform ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </button>
        </div>
      </div>

      {error && <p className="text-red-600 text-sm mt-1">{error}</p>}

      {/* Dropdown */}
      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-lg shadow-xl max-h-80 overflow-y-auto">
          {isLoading ? (
            <div className="p-6 text-center text-slate-500">
              <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-[#1c6bf2]" />
              <p className="mt-2 text-sm">Loading inventory...</p>
            </div>
          ) : filteredInventory.length === 0 ? (
            <div className="p-6 text-center text-slate-500">
              <Package className="mx-auto mb-2 text-slate-300" size={32} />
              <p className="text-sm font-medium">
                {searchTerm
                  ? "No fabrics found matching your search"
                  : "No inventory available"}
              </p>
              {searchTerm && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="mt-2 text-sm text-[#1c6bf2] hover:underline"
                >
                  Clear search
                </button>
              )}
            </div>
          ) : (
            <ul className="py-1">
              {filteredInventory.map((item) => (
                <li key={item._id}>
                  <button
                    type="button"
                    onClick={() => handleSelect(item)}
                    className="w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors border-b border-slate-100 last:border-b-0 group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-semibold text-slate-900 group-hover:text-[#1c6bf2] transition-colors">
                          {item.fabricName}
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-sm text-slate-600">
                          <span className="flex items-center gap-1">
                            <span className="font-medium">Color:</span>
                            <span className="capitalize">{item.color}</span>
                          </span>
                          <span className="text-slate-300">•</span>
                          <span className="flex items-center gap-1">
                            <span className="font-medium">GSM:</span>
                            <span>{item.gsm}</span>
                          </span>
                        </div>
                      </div>
                      <div className="ml-4 text-right">
                        <div
                          className={`text-sm font-bold ${
                            item.availableMeters > 100
                              ? "text-green-600"
                              : item.availableMeters > 50
                                ? "text-yellow-600"
                                : "text-red-600"
                          }`}
                        >
                          {item.availableMeters}m
                        </div>
                        <div className="text-xs text-slate-500">available</div>
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {/* Results count */}
          {!isLoading && filteredInventory.length > 0 && (
            <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 text-center">
              Showing {filteredInventory.length} of {inventoryList.length}{" "}
              fabrics
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FabricAutocomplete;
