import { Easing, interpolate, useCurrentFrame } from "remotion";

const EXPO_OUT = Easing.bezier(0.22, 1, 0.36, 1);

export const FilePickerMock: React.FC<{
  openProgress: number;
  files?: { name: string; size: string; kind: string }[];
  selectedIndex?: number;
  /** Render only the dialog — for overlays that extend past the phone bezel. */
  floating?: boolean;
}> = ({
  openProgress,
  files = [
    { name: "BIOL_1A_Syllabus_Fall2026.pdf", size: "842 KB", kind: "PDF" },
    { name: "Chem101_ReadingList.docx", size: "124 KB", kind: "Word" },
    { name: "Notes.txt", size: "4 KB", kind: "Plain Text" },
  ],
  selectedIndex = 0,
  floating = false,
}) => {
  const frame = useCurrentFrame();
  const scale = interpolate(openProgress, [0, 1], [0.94, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EXPO_OUT,
  });
  const opacity = interpolate(openProgress, [0, 0.35], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  if (openProgress <= 0) return null;

  const dialog = (
    <div
      className="overflow-hidden bg-[#ececec] shadow-2xl"
      style={{
        width: floating ? "100%" : "92%",
        maxWidth: floating ? undefined : 520,
        borderRadius: 12,
        scale,
        border: "1px solid rgba(0,0,0,0.12)",
      }}
    >
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#f6f6f6] border-b border-black/10">
        <span className="text-sm font-medium text-[#333]">Open</span>
        <div className="flex gap-2">
          <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
          <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
          <span className="w-3 h-3 rounded-full bg-[#28c840]" />
        </div>
      </div>

      <div className="flex" style={{ height: floating ? 280 : 320 }}>
        <div className="w-[118px] bg-[#f3f3f3] border-r border-black/8 p-2.5 space-y-1.5 shrink-0">
          {["Desktop", "Documents", "Downloads"].map((item, i) => (
            <div
              key={item}
              className={`text-[11px] px-2 py-1.5 rounded-md ${
                i === 1 ? "bg-[#007aff] text-white font-medium" : "text-[#444]"
              }`}
            >
              {item}
            </div>
          ))}
        </div>

        <div className="flex-1 bg-white p-2.5 min-w-0">
          <div className="grid grid-cols-[1fr_56px_48px] gap-1 text-[9px] font-semibold text-[#888] uppercase tracking-wide px-1.5 pb-2 border-b border-black/6">
            <span>Name</span>
            <span>Size</span>
            <span>Kind</span>
          </div>
          <div className="mt-1 space-y-0.5">
            {files.map((file, i) => {
              const selected = i === selectedIndex;
              const pulse =
                selected && openProgress > 0.7
                  ? 0.92 + 0.08 * Math.sin(frame / 6)
                  : 1;
              return (
                <div
                  key={file.name}
                  className={`grid grid-cols-[1fr_56px_48px] gap-1 items-center px-1.5 py-1.5 rounded-md ${
                    selected ? "bg-[#007aff]/15 text-[#111]" : "text-[#333]"
                  }`}
                  style={{ scale: selected ? pulse : 1 }}
                >
                  <span className="text-[11px] font-medium leading-tight break-all">
                    {file.name}
                  </span>
                  <span className="text-[10px] text-[#666]">{file.size}</span>
                  <span className="text-[10px] text-[#666]">{file.kind}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 px-4 py-3 bg-[#f6f6f6] border-t border-black/10">
        <button className="px-4 py-1.5 text-sm text-[#333] rounded-md border border-black/10 bg-white">
          Cancel
        </button>
        <button className="px-4 py-1.5 text-sm text-white rounded-md bg-[#007aff] font-medium">
          Open
        </button>
      </div>
    </div>
  );

  if (floating) {
    return (
      <div style={{ opacity, width: "100%" }}>
        {dialog}
      </div>
    );
  }

  return (
    <div
      className="absolute inset-0 z-40 flex items-center justify-center"
      style={{
        background: "rgba(0,0,0,0.28)",
        opacity,
      }}
    >
      {dialog}
    </div>
  );
};
