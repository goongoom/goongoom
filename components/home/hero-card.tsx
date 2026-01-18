import { Card } from "@/components/ui/card";

export function HeroCard() {
  return (
    <Card className="relative bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 p-12 mb-8 overflow-hidden border-orange-500">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30" aria-hidden="true" />
      <div className="relative z-10">
        <h1 className="text-4xl font-bold text-white mb-3">
          궁금한 게 있으신가요?
        </h1>
        <p className="text-xl text-white/90">
          익명으로 물어보세요
        </p>
      </div>
    </Card>
  );
}
