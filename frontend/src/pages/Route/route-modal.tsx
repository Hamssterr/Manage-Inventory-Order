import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { routeSchema, type RouteFormValues } from "./schema";
import { handleRouteActions } from "@/hooks/useRoute";
import type { IRoute } from "@/types/route";

// Components
import { HeaderActions } from "./components/header-actions";
import { InfoCard } from "./components/info-card";
import { SalesRepCard } from "./components/sales-rep-card";

export const RouteModal = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const isEditMode = location.pathname.includes("edit");
  const isViewMode = !!id && !isEditMode;

  const originRoute = location?.state?.route as IRoute | undefined;

  const { handleSubmit, isPending } = handleRouteActions(id);

  const methods = useForm<RouteFormValues>({
    resolver: zodResolver(routeSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: {
      routeName: "",
      description: "",
      responsibleSale: [],
    },
  });

  const { reset, handleSubmit: onValidSubmit } = methods;

  useEffect(() => {
    if (originRoute) {
      const salesIds = Array.isArray(originRoute.responsibleSale)
        ? originRoute.responsibleSale.map((item: any) =>
            typeof item === "object" ? item._id : item,
          )
        : [];

      reset({
        routeName: originRoute.routeName,
        description: originRoute.description || "",
        responsibleSale: salesIds,
      });
    }
  }, [originRoute, reset]);

  const onSubmit = (data: RouteFormValues) => {
    handleSubmit(data, isEditMode);
  };

  const handleCancel = () => navigate("/routes");

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
          <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* ── Main Information (Left) ── */}
            <fieldset
              disabled={isPending || isViewMode}
              className="col-span-1 lg:col-span-8 flex flex-col gap-6 disabled:opacity-90"
            >
              <InfoCard disabled={isPending || isViewMode} />
            </fieldset>

            {/* ── Metadata & Assignment (Right) ── */}
            <div className="col-span-1 lg:col-span-4">
              <SalesRepCard disabled={isViewMode} />
            </div>
          </div>
        </div>
      </form>
    </FormProvider>
  );
};
