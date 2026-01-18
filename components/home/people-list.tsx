import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";

export type PeopleListItem = {
  clerkId: string;
  displayName: string | null;
  username: string | null;
  avatarUrl: string | null;
};

interface PeopleListProps {
  people: PeopleListItem[];
}

export function PeopleList({ people }: PeopleListProps) {
  if (!people.length) {
    return (
      <Empty className="p-0 text-left items-start">
        <EmptyHeader className="items-start text-left">
          <EmptyTitle>최근에 본 사람이 없습니다</EmptyTitle>
          <EmptyDescription>질문을 확인하면 여기에 표시됩니다.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <>
      <h2 className="text-lg font-semibold text-gray-900 mb-6">
        최근에 본 사람
      </h2>
      
      <div className="space-y-6">
        {people.map((person) => {
          const displayName = person.displayName || person.username || "사용자";
          const fallback = displayName[0] || "?";

          return (
            <div key={person.clerkId} className="flex items-center gap-3">
              <Avatar className="w-[62px] h-[62px]">
                {person.avatarUrl ? (
                  <AvatarImage src={person.avatarUrl} alt={displayName} />
                ) : null}
                <AvatarFallback>{fallback}</AvatarFallback>
              </Avatar>
            <div>
              <p className="font-medium text-gray-900">{displayName}</p>
              {person.username ? (
                <p className="text-sm text-gray-500">@{person.username}</p>
              ) : null}
            </div>
          </div>
          );
        })}
      </div>
    </>
  );
}
