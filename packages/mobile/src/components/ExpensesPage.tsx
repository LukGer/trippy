import { RouterOutputs } from "@trippy/api";
import { Text, View } from "react-native";

type Trip = RouterOutputs["trips"]["getById"];

export function ExpensesPage({ trip }: { trip: Trip }) {
  return (
    <View>
      {trip.members.map((member) => (
        <Text key={member.id}>{member.name}</Text>
      ))}
    </View>
  );
}
