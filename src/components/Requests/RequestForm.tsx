import { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api";
import { useQuery, useQueryClient } from "@tanstack/react-query";

type Status = "REQUESTED" | "IN_SAMPLING" | "SENT" | "APPROVED" | "REJECTED";

type FabricItem = {
  _id?: string;
  fabricName: string;
  color: string;
  gsm: number;
  requiredMeters: number;
  availableMeters: number;
  status: Status;
};

type SampleRequestFormType = {
  buyerName: string;
  contactPerson: string;
  requiredByDate: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
  remarks?: string;
  items: FabricItem[];
};

type Props = {
  RequestId?: any;
  onClose: () => void;
};

const fetchRequest = async (id: string) => {
  const res = await api.get(`/api/sample-requests/${id}`);
  return res?.data?.data;
};

const ErrorText = ({ msg }: { msg?: string }) =>
  msg ? <p className="text-red-600 text-sm mt-1">{msg}</p> : null;

const emptyItem: FabricItem = {
  fabricName: "",
  color: "",
  gsm: 0,
  requiredMeters: 0,
  availableMeters: 0,
  status: "REQUESTED",
};

const SampleRequestForm = ({ RequestId, onClose }: Props) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors },
  } = useForm<SampleRequestFormType>({
    defaultValues: {
      buyerName: "",
      contactPerson: "",
      requiredByDate: "",
      priority: "MEDIUM",
      remarks: "",
      items: [emptyItem],
    },
  });

  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: "items",
  });

  /* ===============================
     FETCH SINGLE REQUEST
  =============================== */
  const { data: SingleRequest } = useQuery({
    queryKey: ["single-request", RequestId],
    queryFn: () => fetchRequest(RequestId as string),
    enabled: !!RequestId,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  /* ===============================
     PREFILL FORM (REAL FIX)
  =============================== */
  useEffect(() => {
    if (!SingleRequest) return;

    reset({
      buyerName: SingleRequest.buyerName || "",
      contactPerson: SingleRequest.contactPerson || "",
      requiredByDate: SingleRequest.requiredByDate?.slice(0, 10) || "",
      priority: SingleRequest.priority || "MEDIUM",
      remarks: SingleRequest.remarks || "",
      items: SingleRequest.items?.length ? SingleRequest.items : [emptyItem],
    });

    // CRITICAL: sync fieldArray UI
    replace(SingleRequest.items?.length ? SingleRequest.items : [emptyItem]);
  }, [SingleRequest, reset, replace]);

  /* ===============================
     SUBMIT
  =============================== */
  const onSubmit = async (data: SampleRequestFormType) => {
    try {
      if (RequestId) {
        await api.put(`/api/sample-requests/${RequestId}`, data);
      } else {
        await api.post("/api/sample-requests", data);
      }
      await queryClient.invalidateQueries({
        queryKey: ["sample-requests", 1],
      });
      onClose();
      navigate("/sample-requests");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <main className="p-8">
      <h2 className="text-xl font-bold mb-6">
        {RequestId ? "Update Sample Request" : "Create Sample Request"}
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Buyer */}
        <div>
          <label className="text-sm font-semibold">Buyer Name</label>
          <input
            {...register("buyerName", {
              required: "Buyer name is required",
            })}
            className="w-full border p-2 rounded"
          />
          <ErrorText msg={errors.buyerName?.message} />
        </div>

        {/* Contact */}
        <div>
          <label className="text-sm font-semibold">Contact Person</label>
          <input
            {...register("contactPerson", {
              required: "Contact person is required",
            })}
            className="w-full border p-2 rounded"
          />
          <ErrorText msg={errors.contactPerson?.message} />
        </div>

        {/* Date */}
        <div>
          <label className="text-sm font-semibold">Required By Date</label>
          <input
            type="date"
            {...register("requiredByDate", {
              required: "Required date is mandatory",
            })}
            className="w-full border p-2 rounded"
          />
          <ErrorText msg={errors.requiredByDate?.message} />
        </div>

        {/* Priority */}
        <div>
          <label className="text-sm font-semibold">Priority</label>
          <select
            {...register("priority")}
            className="w-full border p-2 rounded"
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
        </div>

        {/* Remarks */}
        <div>
          <label className="text-sm font-semibold">Remarks</label>
          <textarea
            {...register("remarks")}
            className="w-full border p-2 rounded"
          />
        </div>

        {/* FABRIC ITEMS */}
        <div>
          <h3 className="font-bold mb-3">Fabric Items</h3>

          {fields.map((field, index) => (
            <div
              key={field.id}
              className="border rounded p-4 mb-3 bg-slate-50 space-y-3"
            >
              <div>
                <label className="text-sm font-medium">Fabric Name</label>
                <input
                  {...register(`items.${index}.fabricName`, {
                    required: "Fabric name required",
                  })}
                  className="w-full border p-2 rounded"
                />
                <ErrorText msg={errors.items?.[index]?.fabricName?.message} />
              </div>

              <div>
                <label className="text-sm font-medium">Color</label>
                <input
                  {...register(`items.${index}.color`, {
                    required: "Color required",
                  })}
                  className="w-full border p-2 rounded"
                />
              </div>

              <div>
                <label className="text-sm font-medium">GSM</label>
                <input
                  type="number"
                  {...register(`items.${index}.gsm`, {
                    valueAsNumber: true,
                  })}
                  className="w-full border p-2 rounded"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Required Meters</label>
                <input
                  type="number"
                  {...register(`items.${index}.requiredMeters`, {
                    valueAsNumber: true,
                  })}
                  className="w-full border p-2 rounded"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Available Meters</label>
                <input
                  disabled
                  {...register(`items.${index}.availableMeters`, {
                    valueAsNumber: true,
                  })}
                  className="w-full border p-2 rounded bg-gray-100"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Status</label>
                <select
                  {...register(`items.${index}.status`)}
                  className="w-full border p-2 rounded"
                >
                  <option value="REQUESTED">Requested</option>
                  <option value="IN_SAMPLING">In Sampling</option>
                  <option value="SENT">Sent</option>
                  <option value="APPROVED">Approved</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>

              <button
                type="button"
                onClick={() => remove(index)}
                className="text-red-600 text-sm"
              >
                Remove Item
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={() => append(emptyItem)}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Add Fabric Item
          </button>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 bg-green-600 text-white rounded"
        >
          {RequestId ? "Update Request" : "Create Request"}
        </button>
      </form>
    </main>
  );
};

export default SampleRequestForm;
