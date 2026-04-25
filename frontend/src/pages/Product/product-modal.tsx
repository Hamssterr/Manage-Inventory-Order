import { useProductActions } from "@/hooks/useProduct";
import type { IProduct } from "@/types/product";
import { FormProvider, useForm } from "react-hook-form";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { comboProductSchema, type ComboFormValues } from "./schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { HeaderActions } from "./components/header-actions";
import { InfoCard } from "./components/info-card";
import { UnitsCard } from "./components/units-card";
import { ComponentsCard } from "./components/components-card";
import { StatusCard } from "./components/status-card";
import { StockCard } from "./components/stock-card";

export const ProductModal = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();

  const isEditMode = location.pathname.includes("edit");
  const isViewMode = !!id && !isEditMode;

  const originProduct = location?.state?.product as IProduct | undefined;

  const { handleSubmit, isPending } = useProductActions(id);

  const productMethods = useForm<ComboFormValues>({
    resolver: zodResolver(comboProductSchema),
    defaultValues: {
      name: originProduct?.name || "",
      sku: originProduct?.sku || "",
      category: originProduct?.category || "",
      baseUnit: originProduct?.baseUnit || "",
      isSale: originProduct ? originProduct.isSale : true,
      units: originProduct?.units?.length
        ? originProduct.units.map((u) => ({
            unitName: u.unitName,
            priceDefault: u.priceDefault,
            isDefault: u.isDefault,
            exchangeValue: u.exchangeValue,
          }))
        : [
            {
              unitName: "",
              exchangeValue: 1,
              priceDefault: 0,
              isDefault: true,
            },
          ],
      components: originProduct?.components?.length
        ? originProduct.components.map((c) => ({
            productId:
              typeof c.productId === "string" ? c.productId : c.productId._id,
            quantityPerBaseUnit: c.quantityPerBaseUnit,
          }))
        : [],
    },
    mode: "onChange",
  });
  return (
    <FormProvider {...productMethods}>
      <form
        onSubmit={productMethods.handleSubmit((data) =>
          handleSubmit(data, isEditMode),
        )}
        className="flex flex-col h-full bg-slate-50 relative"
      >
        <HeaderActions
          isPending={isPending}
          onCancel={() => navigate("/products")}
          {...{ isEditMode, isViewMode }}
        />

        <div className="flex-1 overflow-auto p-4 md:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-start gap-4">
            <fieldset
              disabled={isViewMode}
              className="col-span-1 lg:col-span-8 flex flex-col gap-4 disabled:opacity-80"
            >
              <InfoCard />
              <ComponentsCard />
              <UnitsCard />
            </fieldset>

            <div className="col-span-1 lg:col-span-4 space-y-4">
              <fieldset
                disabled={isViewMode}
                className="disabled:opacity-80 disabled:pointer-events-none"
              >
                <StatusCard />
              </fieldset>

              <StockCard isViewMode={isViewMode} product={originProduct} />
            </div>
          </div>
        </div>
      </form>
    </FormProvider>
  );
};
