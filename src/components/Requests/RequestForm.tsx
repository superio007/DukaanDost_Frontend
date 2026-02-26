import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import FabricAutocomplete from "../Inventory/FabricAutocomplete";
import api from "../../utils/api";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Upload, X, FileText } from "lucide-react";
import BuyerAutocomplete from "../buyer/BuyerAutocomplete";

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
  attachments?: string[];
};

type InventoryItem = {
  _id: string;
  fabricName: string;
  color: string;
  gsm: number;
  availableMeters: number;
};

type Props = {
  RequestId?: any;
  onClose: () => void;
};

const fetchRequest = async (id: string) => {
  const res = await api.get(`/api/sample-requests/${id}`);
  return res?.data?.data;
};

const fetchAllInventory = async () => {
  const res = await api.get(`/api/inventory?limit=1000`);
  return res?.data?.data?.inventory || [];
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
  const [attachments, setAttachments] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { isSubmitting, errors },
  } = useForm<SampleRequestFormType>({
    defaultValues: {
      buyerName: "",
      contactPerson: "",
      requiredByDate: "",
      priority: "MEDIUM",
      remarks: "",
      items: [emptyItem],
      attachments: [],
    },
  });

  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: "items",
  });

  /* ===============================
     FETCH INVENTORY
  =============================== */
  const { data: inventoryList = [] } = useQuery<InventoryItem[]>({
    queryKey: ["inventory-all"],
    queryFn: fetchAllInventory,
    // staleTime: 1000 * 60 * 5,
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
     PREFILL FORM
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

    replace(SingleRequest.items?.length ? SingleRequest.items : [emptyItem]);
    setAttachments(SingleRequest.attachments || []);
  }, [SingleRequest, reset, replace]);

  /* ===============================
     HANDLE FABRIC SELECTION
  =============================== */
  // const handleFabricSelect = (index: number, inventoryId: string) => {
  //   const selectedInventory = inventoryList.find(
  //     (inv) => inv._id === inventoryId,
  //   );

  //   if (selectedInventory) {
  //     setValue(`items.${index}.fabricName`, selectedInventory.fabricName);
  //     setValue(`items.${index}.color`, selectedInventory.color);
  //     setValue(`items.${index}.gsm`, selectedInventory.gsm);
  //     setValue(
  //       `items.${index}.availableMeters`,
  //       selectedInventory.availableMeters,
  //     );
  //   }
  // };

  /* ===============================
     FILE UPLOAD HANDLER
  =============================== */
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      Array.from(files).forEach((file) => {
        formData.append("files", file);
      });

      const res = await api.post("/api/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const uploadedUrls = res.data.data;
      setAttachments((prev) => [...prev, ...uploadedUrls]);
    } catch (err: any) {
      console.error(err);
      setUploadError(err?.response?.data?.message || "Failed to upload files");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  /* ===============================
     DELETE ATTACHMENT
  =============================== */
  const handleDeleteAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  /* ===============================
     SUBMIT
  =============================== */
  const onSubmit = async (data: SampleRequestFormType) => {
    try {
      const payload = {
        ...data,
        attachments,
      };

      if (RequestId) {
        await api.put(`/api/sample-requests/${RequestId}`, payload);
      } else {
        await api.post("/api/sample-requests", payload);
      }

      await queryClient.invalidateQueries({
        queryKey: ["sample-requests"],
      });
      await queryClient.invalidateQueries({
        queryKey: ["inventory"],
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
        <BuyerAutocomplete
          value={watch("buyerName")}
          onChange={(buyerName, contactPerson) => {
            setValue("buyerName", buyerName);
            setValue("contactPerson", contactPerson);
          }}
          error={errors.buyerName?.message}
        />

        {/* Contact Person - Now auto-filled, but still editable */}
        <div>
          <label className="text-sm font-semibold">Contact Person</label>
          <input
            {...register("contactPerson", {
              required: "Contact person is required",
            })}
            className="w-full border p-2 rounded"
            placeholder="Auto-filled from buyer selection"
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

        {/* FILE ATTACHMENTS */}
        <div>
          <label className="text-sm font-semibold mb-2 block">
            Attachments
          </label>

          <div className="border-2 border-dashed border-slate-300 rounded-lg p-4">
            <label
              htmlFor="file-upload"
              className="flex flex-col items-center justify-center cursor-pointer"
            >
              <Upload className="w-8 h-8 text-slate-400 mb-2" />
              <span className="text-sm text-slate-600">
                Click to upload files (Max 5MB each)
              </span>
              <input
                id="file-upload"
                type="file"
                multiple
                accept="image/*,.pdf"
                onChange={handleFileUpload}
                className="hidden"
                disabled={uploading}
              />
            </label>

            {uploading && (
              <p className="text-sm text-blue-600 mt-2 text-center">
                Uploading...
              </p>
            )}
            {uploadError && (
              <p className="text-sm text-red-600 mt-2 text-center">
                {uploadError}
              </p>
            )}
          </div>

          {/* Attachment List */}
          {attachments.length > 0 && (
            <div className="mt-4 space-y-2">
              {attachments.map((url, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded"
                >
                  <div className="flex items-center gap-3">
                    {url.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                      <img
                        src={url}
                        alt="attachment"
                        className="w-12 h-12 object-cover rounded"
                      />
                    ) : (
                      <FileText className="w-12 h-12 text-slate-400" />
                    )}
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline truncate max-w-xs"
                    >
                      {url.split("/").pop()}
                    </a>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteAttachment(index)}
                    className="p-1 hover:bg-red-100 rounded"
                  >
                    <X size={18} className="text-red-600" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* FABRIC ITEMS */}
        <div>
          <h3 className="font-bold mb-3">Fabric Items</h3>

          {fields.map((field, index) => (
            <div
              key={field.id}
              className="border rounded p-4 mb-3 bg-slate-50 space-y-3"
            >
              {/* FABRIC AUTOCOMPLETE - Replaces the old dropdown */}
              <FabricAutocomplete
                value={watch(`items.${index}.fabricName`) || ""}
                onSelect={(inventory) => {
                  setValue(`items.${index}.fabricName`, inventory.fabricName);
                  setValue(`items.${index}.color`, inventory.color);
                  setValue(`items.${index}.gsm`, inventory.gsm);
                  setValue(
                    `items.${index}.availableMeters`,
                    inventory.availableMeters,
                  );
                }}
                error={errors.items?.[index]?.fabricName?.message}
              />

              {/* Fabric Name - Read-only, auto-filled */}
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Fabric Name
                </label>
                <input
                  {...register(`items.${index}.fabricName`, {
                    required: "Fabric name required",
                  })}
                  className="w-full border border-slate-300 p-2 rounded-lg bg-gray-100 text-slate-700"
                  readOnly
                  placeholder="Auto-filled from selection"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Color</label>
                <input
                  {...register(`items.${index}.color`, {
                    required: "Color required",
                  })}
                  className="w-full border p-2 rounded bg-gray-100"
                  readOnly
                />
              </div>

              <div>
                <label className="text-sm font-medium">GSM</label>
                <input
                  type="number"
                  {...register(`items.${index}.gsm`, {
                    valueAsNumber: true,
                  })}
                  className="w-full border p-2 rounded bg-gray-100"
                  readOnly
                />
              </div>

              <div>
                <label className="text-sm font-medium">Required Meters</label>
                <input
                  type="number"
                  step="0.01"
                  {...register(`items.${index}.requiredMeters`, {
                    valueAsNumber: true,
                    required: "Required meters is required",
                    min: { value: 0.01, message: "Must be greater than 0" },
                  })}
                  className="w-full border p-2 rounded"
                />
                <ErrorText
                  msg={errors.items?.[index]?.requiredMeters?.message}
                />
              </div>

              <div>
                <label className="text-sm font-medium">
                  Available Meters (in Inventory)
                </label>
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
                className="text-red-600 text-sm hover:underline"
              >
                Remove Item
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={() => append(emptyItem)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Add Fabric Item
          </button>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          {isSubmitting
            ? "Saving..."
            : RequestId
              ? "Update Request"
              : "Create Request"}
        </button>
      </form>
    </main>
  );
};

export default SampleRequestForm;
