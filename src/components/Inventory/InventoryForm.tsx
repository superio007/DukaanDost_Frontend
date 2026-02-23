import { useForm } from "react-hook-form";
import api from "../../utils/api";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

type InventoryFormDTO = {
  fabricName: string;
  color: string;
  gsm: number;
  availableMeters: number;
};

const fetchInventory = async (id: string) => {
  const res = await api.get(`/api/inventory/${id}`);
  return res?.data?.data;
};

const updateInventory = async (payload: any, id: string) => {
  const res = await api.put(`/api/inventory/${id}`, payload);
  return res?.data?.data;
};

const createInventory = async (payload: any) => {
  const res = await api.post(`/api/inventory`, payload);
  return res?.data?.data;
};

const InventoryForm = ({ InventoryId, onClose }: any) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<InventoryFormDTO>({
    defaultValues: {
      fabricName: "",
      color: "",
      gsm: 0,
      availableMeters: 0,
    },
  });
  const [submitError, setSubmitError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { data: SingleInventory } = useQuery({
    queryKey: ["single-inventory", InventoryId],
    queryFn: () => fetchInventory(InventoryId),
    enabled: !!InventoryId,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const onSubmit = async (data: InventoryFormDTO) => {
    try {
      setSubmitError(null);

      const payload = {
        fabricName: data.fabricName,
        color: data.color,
        gsm: data.gsm,
        availableMeters: data.availableMeters,
      };

      if (InventoryId) {
        await updateInventory(payload, InventoryId);
      } else {
        await createInventory(payload);
      }
      // THIS REFRESHES TABLE DATA
      await queryClient.invalidateQueries({
        queryKey: ["inventory"],
      });
      onClose();
      reset();
    } catch (err: any) {
      console.error(err);

      setSubmitError(
        err?.response?.data?.message || "Failed to save inventory",
      );
    }
  };
  useEffect(() => {
    if (SingleInventory) {
      reset({
        fabricName: SingleInventory.fabricName,
        color: SingleInventory.color,
        gsm: SingleInventory.gsm,
        availableMeters: SingleInventory.availableMeters,
      });
    }
  }, [SingleInventory, reset]);
  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-white border border-slate-200 rounded p-6 space-y-4"
    >
      <h3 className="text-lg font-bold text-slate-900">
        Add Inventory {InventoryId}
      </h3>

      {/* Fabric Name */}
      <div>
        <label className="text-sm font-semibold text-slate-700">
          Fabric Name
        </label>
        <input
          {...register("fabricName", { required: true })}
          className="w-full mt-1 border border-slate-200 rounded px-3 py-2 text-sm"
          placeholder="Cotton Blend"
        />
        {errors.fabricName && (
          <p className="text-red-500 text-xs mt-1">Required</p>
        )}
      </div>

      {/* Color */}
      <div>
        <label className="text-sm font-semibold text-slate-700">Color</label>
        <input
          {...register("color", { required: true })}
          className="w-full mt-1 border border-slate-200 rounded px-3 py-2 text-sm"
          placeholder="Navy Blue"
        />
        {errors.color && <p className="text-red-500 text-xs mt-1">Required</p>}
      </div>

      {/* GSM */}
      <div>
        <label className="text-sm font-semibold text-slate-700">GSM</label>
        <input
          type="number"
          {...register("gsm", {
            required: true,
            valueAsNumber: true,
          })}
          className="w-full mt-1 border border-slate-200 rounded px-3 py-2 text-sm"
          placeholder="180"
        />
        {errors.gsm && <p className="text-red-500 text-xs mt-1">Required</p>}
      </div>

      {/* Available Meters */}
      <div>
        <label className="text-sm font-semibold text-slate-700">
          Available Meters
        </label>
        <input
          type="number"
          {...register("availableMeters", {
            required: true,
            valueAsNumber: true,
          })}
          className="w-full mt-1 border border-slate-200 rounded px-3 py-2 text-sm"
          placeholder="500"
        />
        {errors.availableMeters && (
          <p className="text-red-500 text-xs mt-1">Required</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="bg-[#1c6bf2] text-white px-4 py-2 rounded text-sm font-semibold hover:opacity-90"
      >
        {isSubmitting
          ? "Saving..."
          : InventoryId
            ? "Update Inventory"
            : "Create Inventory"}
      </button>

      {submitError && (
        <p className="text-red-500 text-sm mt-2 font-medium">{submitError}</p>
      )}
    </form>
  );
};

export default InventoryForm;
