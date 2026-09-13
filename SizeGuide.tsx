import { Ruler } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const rows = [
  { size: "XS", bust: "78 – 82", waist: "60 – 64", hips: "86 – 90" },
  { size: "S", bust: "83 – 87", waist: "65 – 69", hips: "91 – 95" },
  { size: "M", bust: "88 – 92", waist: "70 – 74", hips: "96 – 100" },
  { size: "L", bust: "93 – 98", waist: "75 – 80", hips: "101 – 106" },
  { size: "XL", bust: "99 – 104", waist: "81 – 86", hips: "107 – 112" },
  { size: "XXL", bust: "105 – 110", waist: "87 – 92", hips: "113 – 118" },
];

export function SizeGuide({ trigger }: { trigger?: React.ReactNode }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger ?? (
          <button
            type="button"
            className="label-caps inline-flex items-center gap-2 text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            <Ruler className="size-3.5" aria-hidden="true" />
            Size guide
          </button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto rounded-none">
        <DialogHeader>
          <DialogTitle className="display-xl text-2xl">Size guide</DialogTitle>
          <DialogDescription>
            Not sure about your size? Measure yourself using the guide below. All measurements are
            in centimetres.
          </DialogDescription>
        </DialogHeader>
        <table className="w-full border-collapse text-sm">
          <caption className="sr-only">Body measurements by size</caption>
          <thead>
            <tr className="label-caps border-b border-border text-left text-muted-foreground">
              <th scope="col" className="py-3">
                Size
              </th>
              <th scope="col" className="py-3">
                Bust
              </th>
              <th scope="col" className="py-3">
                Waist
              </th>
              <th scope="col" className="py-3">
                Hips
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.size} className="border-b border-border/60">
                <th scope="row" className="py-3 text-left font-medium">
                  {row.size}
                </th>
                <td className="py-3 tabular-nums">{row.bust}</td>
                <td className="py-3 tabular-nums">{row.waist}</td>
                <td className="py-3 tabular-nums">{row.hips}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="space-y-2 border border-border p-4 text-sm text-muted-foreground">
          <p className="label-caps text-foreground">How to measure</p>
          <p>Bust — around the fullest part, keeping the tape level.</p>
          <p>Waist — around the narrowest part of your torso.</p>
          <p>Hips — around the fullest part, roughly 20cm below the waist.</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
