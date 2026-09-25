import { connectDB } from "@/lib/db";
import { Testimonial } from "@/models";
import {
  upsertTestimonial,
  deleteTestimonial,
} from "@/app/admin/actions";
import { Button } from "@/components/ui/Button";
import { Input, Label, Textarea } from "@/components/ui/Input";

export const dynamic = "force-dynamic";

export default async function TestimonialsAdminPage() {
  await connectDB();
  const items = await Testimonial.find().sort({ displayOrder: 1 }).lean();

  return (
    <div className="space-y-6">
      <header className="border-b border-stone-800 pb-4">
        <h1 className="font-[family-name:var(--font-display)] text-4xl text-white">
          Testimonials
        </h1>
        <p className="mt-1 text-sm text-stone-400">
          {items.length} on site · lower order shows first
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,20rem)_1fr] lg:items-start">
        <section className="lg:sticky lg:top-6">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-amber-500">
            New
          </p>
          <form
            action={async (fd) => {
              "use server";
              await upsertTestimonial(null, fd);
            }}
            className="space-y-4 border-l-2 border-amber-500 pl-5"
          >
            <div>
              <Label>Client name</Label>
              <Input name="clientName" required placeholder="Hassan Ahmed" />
            </div>
            <div>
              <Label>Company</Label>
              <Input name="company" required placeholder="Urban Brew" />
            </div>
            <div>
              <Label>Quote</Label>
              <Textarea
                name="quote"
                required
                rows={4}
                placeholder="What they said…"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Order</Label>
                <Input
                  name="displayOrder"
                  type="number"
                  defaultValue={items.length + 1}
                />
              </div>
              <div className="flex items-end pb-2">
                <label className="flex items-center gap-2 text-sm text-stone-300">
                  <input
                    type="checkbox"
                    name="active"
                    defaultChecked
                    className="size-4 accent-amber-500"
                  />
                  Show on site
                </label>
              </div>
            </div>
            <Button type="submit" className="w-full sm:w-auto">
              Add testimonial
            </Button>
          </form>
        </section>

        <section>
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
            Published list
          </p>
          {items.length === 0 ? (
            <p className="text-sm text-stone-500">No testimonials yet.</p>
          ) : (
            <ul className="divide-y divide-stone-800 border-y border-stone-800">
              {items.map((t, index) => (
                <li key={String(t._id)} className="py-6">
                  <form
                    action={async (fd) => {
                      "use server";
                      await upsertTestimonial(String(t._id), fd);
                    }}
                    className="space-y-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <span className="font-[family-name:var(--font-display)] text-2xl text-stone-600">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span
                        className={`text-xs font-semibold uppercase tracking-wider ${
                          t.active ? "text-emerald-400" : "text-stone-500"
                        }`}
                      >
                        {t.active ? "Live" : "Hidden"}
                      </span>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <Label>Client name</Label>
                        <Input
                          name="clientName"
                          defaultValue={t.clientName}
                          required
                        />
                      </div>
                      <div>
                        <Label>Company</Label>
                        <Input
                          name="company"
                          defaultValue={t.company}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Quote</Label>
                      <Textarea
                        name="quote"
                        defaultValue={t.quote}
                        rows={3}
                        required
                      />
                    </div>

                    <div className="flex flex-wrap items-end justify-between gap-4">
                      <div className="flex flex-wrap items-end gap-4">
                        <div className="w-24">
                          <Label>Order</Label>
                          <Input
                            name="displayOrder"
                            type="number"
                            defaultValue={t.displayOrder}
                          />
                        </div>
                        <label className="mb-2.5 flex items-center gap-2 text-sm text-stone-300">
                          <input
                            type="checkbox"
                            name="active"
                            defaultChecked={t.active}
                            className="size-4 accent-amber-500"
                          />
                          Show on site
                        </label>
                      </div>
                      <div className="flex gap-2">
                        <Button type="submit" size="sm" variant="secondary">
                          Save
                        </Button>
                        <button
                          formAction={async () => {
                            "use server";
                            await deleteTestimonial(String(t._id));
                          }}
                          className="h-9 px-3 text-sm text-red-400 hover:text-red-300"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </form>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
