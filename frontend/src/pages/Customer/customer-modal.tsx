import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { customerSchema, type CustomerFormValues } from "./schema";
import { useCustomerActions } from "@/hooks/useCustomer";
import type { ICustomer } from "@/types/customer";

// Components
import { HeaderActions } from "./components/header-actions";
import { InfoCard } from "./components/info-card";
import { AddressCard } from "./components/address-card";
import { SalesRepCard } from "./components/sales-rep-card";

export const CustomerModal = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const isEditMode = location.pathname.includes("edit");
  const isViewMode = !!id && !isEditMode;

  const originCustomer = location?.state?.customer as ICustomer | undefined;

  const { handleSubmit, isPending } = useCustomerActions(id);

  // ─── Form initialization ──────────────────────────────────────────────────
  const methods = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: {
      name: "",
      phoneNumber: "",
      taxCode: "",
      saleRep: "",
      addresses: {
        addressDetail: "",
        ward: "",
        district: "",
        province: "",
        routeId: "",
      },
    },
  });

  const { reset, handleSubmit: onValidSubmit } = methods;

  // Populate form when editing an existing customer
  useEffect(() => {
    if (originCustomer) {
      reset({
        name: originCustomer.name,
        phoneNumber: originCustomer.phoneNumber,
        taxCode:
          originCustomer.taxCode && originCustomer.taxCode !== "NOT_PROVIDED"
            ? originCustomer.taxCode
            : "",
        saleRep:
          typeof originCustomer.saleRep === "object"
            ? (originCustomer.saleRep as any)._id
            : originCustomer.saleRep || "",
        addresses: {
          addressDetail: originCustomer.addresses?.addressDetail || "",
          ward: originCustomer.addresses?.ward || "",
          district: originCustomer.addresses?.district || "",
          province: originCustomer.addresses?.province || "",
          routeId:
            typeof originCustomer.addresses?.routeId === "object"
              ? (originCustomer.addresses.routeId as any)._id || ""
              : originCustomer.addresses?.routeId || "",
        },
      });
    }
  }, [originCustomer, reset]);

  // ─── Submit handler ───────────────────────────────────────────────────────
  const onSubmit = (data: CustomerFormValues) => {
    const payload = {
      ...data,
      taxCode: data.taxCode || "NOT_PROVIDED",
      saleRep: data.saleRep || undefined,
      addresses: {
        ...data.addresses,
        routeId: data.addresses.routeId || undefined,
      },
    };
    handleSubmit(payload, isEditMode);
  };

  const handleCancel = () => navigate("/customers");

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <FormProvider {...methods}>
      <form
        onSubmit={onValidSubmit(onSubmit)}
        className="flex flex-col h-full bg-slate-50/50"
      >
        <HeaderActions
          isPending={isPending}
          onCancel={handleCancel}
          isEditMode={isEditMode}
          isViewMode={isViewMode}
        />

        <div className="flex-1 overflow-auto p-4 md:p-8 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 items-start">
            {/* ── Main Information (Left Column) ── */}
            <fieldset
              disabled={isPending || isViewMode}
              className="flex flex-col col-span-1 lg:col-span-8 space-y-4 lg:space-y-6 disabled:opacity-90"
            >
              <InfoCard />
              <AddressCard disabled={isPending || isViewMode} />
            </fieldset>

            {/* ── Metadata & Assignment (Right Column) ── */}
            <div className="col-span-1 lg:col-span-4">
              <fieldset
                disabled={isPending || isViewMode}
                className="disabled:opacity-90 h-full"
              >
                <SalesRepCard
                  disabled={isPending || isViewMode}
                  initialDisplay={
                    typeof originCustomer?.saleRep === "object"
                      ? (originCustomer.saleRep as any).displayName
                      : undefined
                  }
                />
              </fieldset>
            </div>
          </div>
        </div>
      </form>
    </FormProvider>
  );
};
