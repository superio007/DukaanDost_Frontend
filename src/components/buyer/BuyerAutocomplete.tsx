import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { buyerApi } from "../../utils/api";
import { ChevronDown, Search, X } from "lucide-react";

interface ActiveBuyer {
  _id: string;
  name: string;
  contactPerson: string;
}

interface Props {
  value: string;
  onChange: (buyerName: string, contactPerson: string) => void;
  error?: string;
}

const BuyerAutocomplete = ({ value, onChange, error }: Props) => {
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

  // Fetch active buyers
  const { data: buyers = [], isLoading } = useQuery<ActiveBuyer[]>({
    queryKey: ["buyers-active"],
    queryFn: async () => {
      const res = await buyerApi.getActiveBuyers();
      return res?.data?.data || [];
    },
    staleTime: 1000 * 60 * 5,
  });

  // Filter buyers based on search
  const filteredBuyers = buyers.filter((buyer) =>
    buyer.name.toLowerCase().includes(debouncedSearch.toLowerCase()),
  );

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

  const handleSelect = (buyer: ActiveBuyer) => {
    setSearchTerm(buyer.name);
    onChange(buyer.name, buyer.contactPerson);
    setIsOpen(false);
  };

  const handleClear = () => {
    setSearchTerm("");
    onChange("", "");
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-sm font-semibold text-slate-700 mb-2">
        Buyer Name <span className="text-red-500">*</span>
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
          placeholder="Search or select buyer..."
          className={`w-full pl-10 pr-20 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1c6bf2] ${
            error ? "border-red-500" : "border-slate-300"
          }`}
        />

        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
          {searchTerm && (
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
            onClick={() => setIsOpen(!isOpen)}
            className="p-1 hover:bg-slate-100 rounded transition-colors"
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
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-slate-500">
              <div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-[#1c6bf2]" />
              <p className="mt-2 text-sm">Loading buyers...</p>
            </div>
          ) : filteredBuyers.length === 0 ? (
            <div className="p-4 text-center text-slate-500">
              <p className="text-sm">
                {searchTerm
                  ? "No buyers found matching your search"
                  : "No buyers available"}
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
              {filteredBuyers.map((buyer) => (
                <li key={buyer._id}>
                  <button
                    type="button"
                    onClick={() => handleSelect(buyer)}
                    className="w-full px-4 py-3 text-left hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-b-0"
                  >
                    <div className="font-semibold text-slate-900">
                      {buyer.name}
                    </div>
                    <div className="text-sm text-slate-500 mt-1">
                      Contact: {buyer.contactPerson}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default BuyerAutocomplete;
