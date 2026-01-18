import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const recentPeople = [
  {
    name: "김민지",
    username: "minji_kim",
    seed: "user1",
  },
  {
    name: "박서준",
    username: "seojun_park",
    seed: "user2",
  },
  {
    name: "이하은",
    username: "haeun_lee",
    seed: "user3",
  },
  {
    name: "최지훈",
    username: "jihoon_choi",
    seed: "user4",
  },
];

export function PeopleList() {
  return (
    <>
      <h2 className="text-lg font-semibold text-gray-900 mb-6">
        최근에 본 사람
      </h2>
      
      <div className="space-y-6">
        {recentPeople.map((person) => (
          <div key={person.username} className="flex items-center gap-3">
            <Avatar className="w-[62px] h-[62px]">
              <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${person.seed}`} alt={person.name} />
              <AvatarFallback>{person.name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-gray-900">{person.name}</p>
              <p className="text-sm text-gray-500">@{person.username}</p>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
