import Image from "next/image";

export default function BrainrotImageCard({ name, imageSrc }) {
  return (
    <div
      className="bg-white dark:bg-slate-900 rounded-[40px] w-full h-[50vh] flex items-center justify-center mx-auto pointer-events-none transition-colors"
    >
      {imageSrc && (
        <div className="relative w-[80%] h-[80%]"> 
          <Image
            src={imageSrc}
            alt=""
            fill
            style={{ objectFit: "contain" }}
          />
        </div>
      )}
    </div>
  );
}
