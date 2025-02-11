import { useTrip } from "@/src/hooks/useTrip";
import { TrippyTabs } from "@/src/navigation/trippy-tabs";
import { trpc } from "@/src/utils/trpc";
import type { RouterOutputs } from "@trippy/api";
import type { Documents } from "@trippy/core/src/documents/documents";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

type Trip = RouterOutputs["trips"]["getById"];
type Member = Trip["members"][0];

export default function TripDocumentsScreen() {
	const trip = useTrip();

	const { data = [], isLoading } = trpc.documents.getByTripId.useQuery(trip.id);

	const usersWithoutDocuments = trip.members.filter(
		(member) => !data.some((d) => d.userId === member.id),
	);

	return (
		<>
			<TrippyTabs.Screen
				options={{
					title: "Documents",
				}}
			/>
			<View style={styles.page}>
				<View style={styles.list}>
					{data.map((document) => (
						<DocumentItem key={document.id} document={document} />
					))}

					{usersWithoutDocuments.map((user) => (
						<NoDocumentItem key={user.id} user={user} />
					))}
				</View>
			</View>
		</>
	);
}

function DocumentItem({ document }: { document: Documents.Info }) {
	return (
		<View style={styles.item}>
			<Text style={styles.itemTitle}>{document.user.name}</Text>
		</View>
	);
}

function NoDocumentItem({ user }: { user: Member }) {
	return (
		<View style={styles.missingItem}>
			<Text style={styles.missingItemTitle}>{user.name}</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	page: {
		flex: 1,
		paddingHorizontal: 20,
		paddingTop: 20,
	},
	list: {
		gap: 12,
	},
	item: {
		backgroundColor: "white",
		borderRadius: 10,
		borderCurve: "continuous",
		overflow: "hidden",
		padding: 12,
	},
	missingItem: {
		borderRadius: 10,
		borderCurve: "continuous",
		padding: 12,
		borderColor: "gray",
		borderWidth: 2,
		borderStyle: "dashed",
	},
	itemTitle: {
		fontSize: 16,
		fontWeight: "bold",
	},
	missingItemTitle: {
		fontSize: 16,
		fontWeight: "bold",
		color: "gray",
	},
});
