import { IconLoader } from "@/assets/IconLoader";

export default function Loader({ loading }: { loading: boolean }) {
  if (!loading) return null;
  return (
    <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-75 backdrop-blur-lg z-50 flex justify-center items-center">
      <div className="flex justify-center items-center flex-col gap-6 text-white animate-spin-slow">
        <IconLoader height={80} width={80} />
      </div>
    </div>
  );
}
