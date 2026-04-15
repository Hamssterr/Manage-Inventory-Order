import { FormProvider, useForm } from "react-hook-form";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  inventorySchema,
  importInventorySchema,
  type InventoryFormValues,
  type ImportInventoryFormValues,
} from "./schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { HeaderActions } from "./components/header-actions";
import { InfoCard } from "./components/info-card";
import { UnitsCard } from "./components/units-card";
import { StatusCard } from "./components/status-card";
import type { IProduct } from "@/types/product";
import { StockCard } from "./components/stock-card";
import { ImportCard } from "./components/import-card";
import { useInventoryActions } from "@/hooks/useInventory";

export const InventoryModal = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();

  const isImportMode = location.pathname.includes("import");
  const isEditMode = location.pathname.includes("edit");
  const isViewMode = !!id && !isEditMode && !isImportMode;

  const originProduct = location.state?.product as IProduct | undefined;

  const { onInventorySubmit, onImportSubmit, isPending } =
    useInventoryActions(id);

  // ─── Form cho Create / Edit / View ───
  const inventoryMethods = useForm<InventoryFormValues>({
    resolver: zodResolver(inventorySchema),
    defaultValues: {
      name: originProduct?.name || "",
      sku: originProduct?.sku || "",
      category: originProduct?.category || "",
      baseUnit: originProduct?.baseUnit || "",
      isSale: originProduct ? originProduct.isSale : true,
      isGift: originProduct ? originProduct.isGift : false,
      units: originProduct?.units?.length
        ? originProduct.units.map((u) => ({
            unitName: u.unitName,
            exchangeValue: u.exchangeValue,
            priceDefault: !!u.priceDefault ? u.priceDefault : 0,
            isDefault: u.isDefault,
          }))
        : [
            {
              unitName: "",
              exchangeValue: 1,
              priceDefault: 0,
              isDefault: true,
            },
          ],
    },
    mode: "onChange",
  });

  // ─── Form cho Import
  const importMethods = useForm<ImportInventoryFormValues>({
    resolver: zodResolver(importInventorySchema),
    defaultValues: {
      unitName: "",
      quantity: 1,
      note: "",
    },
    mode: "onChange",
  });

  const activeSubmit = isImportMode
    ? importMethods.handleSubmit(onImportSubmit)
    : inventoryMethods.handleSubmit((data) =>
        onInventorySubmit(data, isEditMode),
      );

  return (
    <FormProvider {...inventoryMethods}>
      <form
        onSubmit={activeSubmit}
        className="flex flex-col h-full bg-slate-50 relative"
      >
        <HeaderActions
          isPending={isPending}
          onCancel={() => navigate("/inventory")}
          {...{ isViewMode, isEditMode, isImportMode }}
        />

        <div className="flex-1 overflow-auto p-4 md:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-start gap-4">
            <fieldset
              disabled={isViewMode || isImportMode}
              className="col-span-1 lg:col-span-8 flex flex-col gap-4 disabled:opacity-80"
            >
              <InfoCard />
              <UnitsCard />
            </fieldset>

            <div className="space-y-4 col-span-1 lg:col-span-4 ">
              <fieldset
                disabled={isViewMode || isImportMode}
                className="disabled:opacity-80 disabled:pointer-events-none"
              >
                <StatusCard />
              </fieldset>

              <StockCard isViewMode={isViewMode} product={originProduct} />

              <ImportCard
                form={importMethods}
                units={originProduct?.units || []}
                isImportMode={isImportMode}
              />
            </div>
          </div>
        </div>
      </form>
    </FormProvider>
  );
};
