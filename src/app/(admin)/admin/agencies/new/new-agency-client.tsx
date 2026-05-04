"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ChevronDown, ChevronUp, Lock } from "lucide-react";
import { useForm } from "@tanstack/react-form";
import {
  newAgencySchema,
  availableFeatures,
  type NewAgencyFormInput,
} from "@/lib/forms/new-agency-schema";
import {
  firstValidationMessage,
  slugifyNameToSlug,
  validationMessageFromUnknown,
} from "@/lib/forms/validation-message";

const LABEL_ERR_ASIDE =
  "shrink-0 max-w-[55%] text-right text-[11px] font-medium tracking-normal normal-case leading-snug text-red-600";

const defaultFormValues: NewAgencyFormInput = {
  name: "",
  slug: "",
  ghlLocationId: "",
  ghlWebhookUrl: "",
  ghlAccessToken: "",
  featuresArray: ["beast-mode-drip", "field-trainer", "resource-hub"],
  theme: {
    primaryColor: "#0075de",
    accentColor: "#097fe8",
    backgroundColor: "#f6f5f4",
    sidebarColor: "#1F1E1C",
    logoUrl: "",
    faviconUrl: "",
    fontFamily: "Inter",
    borderRadius: "8px",
    dashboardTitle: "",
  },
};

export function NewAgencyClient() {
  const router = useRouter();
  const createAgency = useMutation(api.admin.createAgency);

  const [showToken, setShowToken] = React.useState(false);
  const [showBrandTheme, setShowBrandTheme] = React.useState(false);
  const [submitBanner, setSubmitBanner] = React.useState<string | null>(null);
  /** Prior `name` snapshot for auto-slug (matches slug to “auto from previous name” rule). */
  const nameBeforeChangeRef = React.useRef("");

  const form = useForm({
    defaultValues: defaultFormValues,
    validators: {
      onSubmit: newAgencySchema,
    },
    onSubmit: async ({ value }) => {
      setSubmitBanner(null);
      form.setFieldMeta("slug", (prev) => {
        const map = { ...(prev.errorMap ?? {}) };
        delete map.onSubmit;
        return { ...prev, errorMap: map };
      });

      try {
        const theme = value.theme;

        await createAgency({
          name: value.name,
          slug: value.slug,
          ghlLocationId: value.ghlLocationId,
          ghlWebhookUrl: value.ghlWebhookUrl || undefined,
          ghlAccessToken: value.ghlAccessToken,
          featuresArray: value.featuresArray,
          theme:
            showBrandTheme && theme
              ? {
                  primaryColor: theme.primaryColor,
                  accentColor: theme.accentColor,
                  backgroundColor: theme.backgroundColor,
                  sidebarColor: theme.sidebarColor,
                  textColor: "#111827",
                  logoUrl: theme.logoUrl || undefined,
                  faviconUrl: theme.faviconUrl || undefined,
                  fontFamily: theme.fontFamily,
                  borderRadius: theme.borderRadius,
                  dashboardTitle: theme.dashboardTitle.trim() || value.name,
                }
              : undefined,
        });

        router.push("/admin/agencies");
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Failed to create agency";
        setSubmitBanner(message);
        if (message.includes("Agency slug already exists")) {
          form.setFieldMeta("slug", (prev) => ({
            ...prev,
            errorMap: {
              ...(prev.errorMap ?? {}),
              onSubmit: "Agency slug already exists",
            },
          }));
        }
      }
    },
  });

  return (
    <div className="max-w-[1000px] mx-auto h-full py-12">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-zinc-900">
            Register New Agency
          </h1>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
          Step 1 of Provisioning
        </div>
      </div>

      <Separator className="mb-8" />

      {submitBanner ? (
        <div className="mb-6 p-4 rounded-md bg-red-50 text-red-600 text-sm border border-red-200">
          {submitBanner}
        </div>
      ) : null}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          void form.handleSubmit();
        }}
        className="space-y-8"
      >
        <div className="grid grid-cols-2 gap-6">
          <form.Field
            name="name"
            listeners={{
              onChange: ({ value }) => {
                const prevName = nameBeforeChangeRef.current;
                const autoSlugFromPrev = slugifyNameToSlug(prevName);
                const currentSlug = form.getFieldValue("slug");
                const shouldAutoSync =
                  !currentSlug || currentSlug === autoSlugFromPrev;
                if (shouldAutoSync) {
                  form.setFieldValue("slug", slugifyNameToSlug(value));
                }
                nameBeforeChangeRef.current = value;
              },
            }}
          >
            {(field) => {
              const msg = firstValidationMessage(field.state.meta.errors);
              return (
                <div className="space-y-2">
                  <div className="flex justify-between items-start gap-3">
                    <label className="text-xs font-semibold tracking-widest text-zinc-500 uppercase">
                      <span className="text-blue-600" aria-hidden>
                        *{" "}
                      </span>
                      Agency Name
                    </label>
                    {msg ? (
                      <span className={LABEL_ERR_ASIDE} role="alert">
                        {msg}
                      </span>
                    ) : null}
                  </div>
                  <Input
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    placeholder="e.g. Divinity Group"
                    aria-required
                    className="bg-white"
                  />
                </div>
              );
            }}
          </form.Field>

          <form.Field name="slug">
            {(field) => {
              const schemaErr = firstValidationMessage(
                field.state.meta.errors,
              );
              const submitErr = validationMessageFromUnknown(
                field.state.meta.errorMap?.onSubmit,
              );
              const msg = schemaErr ?? submitErr;
              return (
                <div className="space-y-2">
                  <div className="flex justify-between items-start gap-3">
                    <label className="text-xs font-semibold tracking-widest text-zinc-500 uppercase">
                      <span className="text-blue-600" aria-hidden>
                        *{" "}
                      </span>
                      Slug
                    </label>
                    {msg ? (
                      <span className={LABEL_ERR_ASIDE} role="alert">
                        {msg}
                      </span>
                    ) : (
                      <span className="text-xs font-semibold tracking-widest text-zinc-400 uppercase">
                        Auto • Editable
                      </span>
                    )}
                  </div>
                  <Input
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    placeholder="divinity-group"
                    aria-required
                    className="bg-zinc-50 font-mono text-sm"
                  />
                  {!msg ? (
                    <p className="text-[13px] text-zinc-500">
                      This is your agency&apos;s unique link. Use lowercase and
                      hyphens only.
                    </p>
                  ) : null}
                </div>
              );
            }}
          </form.Field>
        </div>

        <form.Field name="ghlLocationId">
          {(field) => {
            const msg = firstValidationMessage(field.state.meta.errors);
            return (
              <div className="space-y-2">
                <div className="flex justify-between items-start gap-3">
                  <label className="text-xs font-semibold tracking-widest text-zinc-500 uppercase">
                    <span className="text-blue-600" aria-hidden>
                      *{" "}
                    </span>
                    GHL Location ID
                  </label>
                  {msg ? (
                    <span className={LABEL_ERR_ASIDE} role="alert">
                      {msg}
                    </span>
                  ) : null}
                </div>
                <Input
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  placeholder="e.g. abcDEF123ghiJKL456"
                  aria-required
                  className="bg-white font-mono text-sm"
                />
                {!msg ? (
                  <p className="text-[13px] text-zinc-500">
                    The location this agency lives under. Found in your GHL
                    sub-account settings.
                  </p>
                ) : null}
              </div>
            );
          }}
        </form.Field>

        <form.Field name="ghlWebhookUrl">
          {(field) => {
            const msg = firstValidationMessage(field.state.meta.errors);
            return (
              <div className="space-y-2">
                <div className="flex justify-between items-start gap-3">
                  <label className="text-xs font-semibold tracking-widest text-zinc-500 uppercase">
                    GHL Webhook URL
                  </label>
                  {msg ? (
                    <span className={LABEL_ERR_ASIDE} role="alert">
                      {msg}
                    </span>
                  ) : (
                    <span className="text-xs font-semibold tracking-widest text-zinc-400 uppercase">
                      Optional
                    </span>
                  )}
                </div>
                <Input
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  placeholder="https://services.leadconnectorhq.com/hooks/..."
                  className="bg-zinc-50 font-mono text-sm"
                />
                {!msg ? (
                  <p className="text-[13px] text-zinc-500">
                    Add this if you want events pushed back into GHL. You can
                    wire it up later.
                  </p>
                ) : null}
              </div>
            );
          }}
        </form.Field>

        <form.Field name="ghlAccessToken">
          {(field) => {
            const msg = firstValidationMessage(field.state.meta.errors);
            return (
              <div className="space-y-2">
                <div className="flex justify-between items-start gap-3">
                  <label className="flex items-center gap-1.5 text-xs font-semibold tracking-widest text-zinc-500 uppercase">
                    <span className="text-blue-600 shrink-0" aria-hidden>
                      *{" "}
                    </span>
                    <Lock size={12} className="shrink-0" />
                    GHL Access Token
                  </label>
                  {msg ? (
                    <span className={LABEL_ERR_ASIDE} role="alert">
                      {msg}
                    </span>
                  ) : (
                    <span className="text-xs font-semibold tracking-widest text-blue-500 uppercase">
                      Encrypted
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Input
                    type={showToken ? "text" : "password"}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    aria-required
                    className="bg-white font-mono text-sm pr-16"
                  />
                  <button
                    type="button"
                    onClick={() => setShowToken(!showToken)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold tracking-widest text-zinc-500 hover:text-zinc-800 uppercase"
                  >
                    {showToken ? "Hide" : "Show"}
                  </button>
                </div>
                <div className="mt-2 p-3 bg-orange-50 border border-orange-100 rounded-md flex items-center gap-2 text-sm text-orange-800">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                    <path d="M12 9v4" />
                    <path d="M12 17h.01" />
                  </svg>
                  We encrypt this immediately. It&apos;s never shown to clients
                  or staff.
                </div>
              </div>
            );
          }}
        </form.Field>

        <form.Field name="featuresArray">
          {(field) => {
            const msg = firstValidationMessage(field.state.meta.errors);
            return (
              <div className="space-y-3">
                <div className="flex justify-between items-start gap-3">
                  <label className="text-xs font-semibold tracking-widest text-zinc-500 uppercase">
                    Features
                  </label>
                  {msg ? (
                    <span className={LABEL_ERR_ASIDE} role="alert">
                      {msg}
                    </span>
                  ) : (
                    <span className="text-xs font-semibold tracking-widest text-zinc-400 uppercase">
                      Click to toggle
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 p-4 bg-zinc-50 border border-zinc-100 rounded-md">
                  {availableFeatures.map((f) => {
                    const active = field.state.value.includes(f);
                    return (
                      <button
                        key={f}
                        type="button"
                        onClick={() => {
                          const next = active
                            ? field.state.value.filter((id) => id !== f)
                            : [...field.state.value, f];
                          field.handleChange(next);
                        }}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-colors ${
                          active
                            ? "bg-white border-blue-200 text-blue-700 shadow-sm border"
                            : "bg-white border-zinc-200 text-zinc-500 border hover:border-zinc-300"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${active ? "bg-blue-500" : "bg-transparent"}`}
                        ></span>
                        {f}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          }}
        </form.Field>

        <div className="border border-zinc-200 rounded-md overflow-hidden bg-zinc-50">
          <button
            type="button"
            onClick={() => setShowBrandTheme(!showBrandTheme)}
            className="w-full flex items-center justify-between p-4 hover:bg-zinc-100/50 transition-colors text-left"
          >
            <div>
              <h3 className="text-sm font-semibold text-zinc-900">
                Brand Theme
              </h3>
              <p className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase mt-1">
                Optional • Can be configured later
              </p>
            </div>
            {showBrandTheme ? (
              <ChevronUp size={16} className="text-zinc-400" />
            ) : (
              <ChevronDown size={16} className="text-zinc-400" />
            )}
          </button>

          {showBrandTheme && (
            <div className="p-6 border-t border-zinc-200 bg-white space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <form.Field name="theme.primaryColor">
                  {(field) => (
                    <div className="space-y-2">
                      <label className="text-xs font-semibold tracking-widest text-zinc-500 uppercase">
                        Primary Color
                      </label>
                      <div className="flex gap-2">
                        <div
                          className="w-10 h-10 rounded-md border border-zinc-200 overflow-hidden shrink-0"
                          style={{ backgroundColor: field.state.value }}
                        />
                        <Input
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          onBlur={field.handleBlur}
                          className="font-mono text-sm"
                        />
                      </div>
                    </div>
                  )}
                </form.Field>
                <form.Field name="theme.accentColor">
                  {(field) => (
                    <div className="space-y-2">
                      <label className="text-xs font-semibold tracking-widest text-zinc-500 uppercase">
                        Accent Color
                      </label>
                      <div className="flex gap-2">
                        <div
                          className="w-10 h-10 rounded-md border border-zinc-200 overflow-hidden shrink-0"
                          style={{ backgroundColor: field.state.value }}
                        />
                        <Input
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          onBlur={field.handleBlur}
                          className="font-mono text-sm"
                        />
                      </div>
                    </div>
                  )}
                </form.Field>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <form.Field name="theme.backgroundColor">
                  {(field) => (
                    <div className="space-y-2">
                      <label className="text-xs font-semibold tracking-widest text-zinc-500 uppercase">
                        Background Color
                      </label>
                      <div className="flex gap-2">
                        <div
                          className="w-10 h-10 rounded-md border border-zinc-200 overflow-hidden shrink-0"
                          style={{ backgroundColor: field.state.value }}
                        />
                        <Input
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          onBlur={field.handleBlur}
                          className="font-mono text-sm"
                        />
                      </div>
                    </div>
                  )}
                </form.Field>
                <form.Field name="theme.sidebarColor">
                  {(field) => (
                    <div className="space-y-2">
                      <label className="text-xs font-semibold tracking-widest text-zinc-500 uppercase">
                        Sidebar Color
                      </label>
                      <div className="flex gap-2">
                        <div
                          className="w-10 h-10 rounded-md border border-zinc-200 overflow-hidden shrink-0"
                          style={{ backgroundColor: field.state.value }}
                        />
                        <Input
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          onBlur={field.handleBlur}
                          className="font-mono text-sm"
                        />
                      </div>
                    </div>
                  )}
                </form.Field>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <form.Field name="theme.logoUrl">
                  {(field) => {
                    const msg = firstValidationMessage(field.state.meta.errors);
                    return (
                      <div className="space-y-2">
                        <div className="flex justify-between items-start gap-3">
                          <label className="text-xs font-semibold tracking-widest text-zinc-500 uppercase">
                            Logo URL
                          </label>
                          {msg ? (
                            <span className={LABEL_ERR_ASIDE} role="alert">
                              {msg}
                            </span>
                          ) : (
                            <span className="text-xs font-semibold tracking-widest text-zinc-400 uppercase shrink-0">
                              Optional
                            </span>
                          )}
                        </div>
                        <Input
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          onBlur={field.handleBlur}
                          placeholder="https://cdn.../logo.svg"
                          className="font-mono text-sm"
                        />
                      </div>
                    );
                  }}
                </form.Field>
                <form.Field name="theme.faviconUrl">
                  {(field) => {
                    const msg = firstValidationMessage(field.state.meta.errors);
                    return (
                      <div className="space-y-2">
                        <div className="flex justify-between items-start gap-3">
                          <label className="text-xs font-semibold tracking-widest text-zinc-500 uppercase">
                            Favicon URL
                          </label>
                          {msg ? (
                            <span className={LABEL_ERR_ASIDE} role="alert">
                              {msg}
                            </span>
                          ) : (
                            <span className="text-xs font-semibold tracking-widest text-zinc-400 uppercase shrink-0">
                              Optional
                            </span>
                          )}
                        </div>
                        <Input
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          onBlur={field.handleBlur}
                          placeholder="https://cdn.../favicon.ico"
                          className="font-mono text-sm"
                        />
                      </div>
                    );
                  }}
                </form.Field>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <form.Field name="theme.fontFamily">
                  {(field) => (
                    <div className="space-y-2">
                      <label className="text-xs font-semibold tracking-widest text-zinc-500 uppercase">
                        Font Family
                      </label>
                      <Input
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                        placeholder="Inter"
                      />
                    </div>
                  )}
                </form.Field>
                <form.Field name="theme.borderRadius">
                  {(field) => (
                    <div className="space-y-2">
                      <label className="text-xs font-semibold tracking-widest text-zinc-500 uppercase">
                        Border Radius
                      </label>
                      <Input
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                        placeholder="8px"
                      />
                    </div>
                  )}
                </form.Field>
              </div>

              <form.Field name="theme.dashboardTitle">
                {(field) => (
                  <div className="space-y-2">
                    <label className="text-xs font-semibold tracking-widest text-zinc-500 uppercase">
                      Dashboard Title
                    </label>
                    <Input
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      placeholder="e.g. Divinity Hub"
                    />
                  </div>
                )}
              </form.Field>
            </div>
          )}
        </div>

        <form.Subscribe selector={(state) => state.isSubmitting}>
          {(isSubmitting) => (
            <div className="flex items-center gap-2 py-4 justify-end">
              <Button
                type="button"
                variant="ghost"
                onClick={() => router.push("/admin/agencies")}
                className="px-8 text-zinc-500 hover:text-zinc-900"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating..." : "Create Agency"}
              </Button>
            </div>
          )}
        </form.Subscribe>
      </form>
    </div>
  );
}
