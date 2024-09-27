import { Message } from "../message/message";
import { Trip } from "../trip/trip";
import { User } from "../user/user";

export namespace Seeder {
  export const seedUsers = async () => {
    await User.create({
      name: "Yusuf Dikeç",
      email: "yusuf.dikec@gmail.com",
      clerkId: "1",
      pictureUrl:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS3mqyM5hxo930TzOZz_9M0PpV3dT95rzjl4OJtDcQeqjT41Yvk",
    });

    await User.create({
      name: "Rachel Gunn",
      email: "rachel.gunn@gmail.com",
      clerkId: "2",
      pictureUrl:
        "https://i.dailymail.co.uk/1s/2024/08/13/10/88474131-13738399-image-a-35_1723542466817.jpg",
    });

    await User.create({
      name: "Peter Zwegat",
      email: "peter.zwegat@gmail.com",
      clerkId: "3",
      pictureUrl:
        "https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcSCocWPhqXEY2alvWQOoXQfO7Gzt63fnrfSJ3G-vC3gu4jWSQs_",
    });

    await User.create({
      name: "José Mourinho",
      email: "jose.mourinho@gmail.com",
      clerkId: "4",
      pictureUrl:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSG8_UTVsOlZBAZ8MVYu-wIBXpQB0NYq8zqeGs3ORLGX3GCA9oH",
    });
  };

  export const seedTrips = async () => {
    await Trip.create({
      name: "Istanbul",
      startDate: new Date("2024-10-01"),
      endDate: new Date("2024-10-05"),
      members: [
        { userId: "usr_01J75RS6Y5XFZ0RXWTRMWX18D7", isAdmin: true },
        { userId: "usr_01J75RS7K6KZ1CJ0G1ZWE6AWBJ", isAdmin: false },
        { userId: "usr_01J75RS7MDJV4MWRHE2J9TE4ZM", isAdmin: false },
        { userId: "usr_01J75RS7NGRXV554Y2X12RFDPG", isAdmin: false },
      ],
    });
  };

  export const seedMessages = async () => {
    await Message.create({
      userId: "usr_01J75TKXX6BEBG20A0JTAZXDTY",
      tripId: "trp_01J7E7RF32D1X039XFBZJ0FEM8",
      content: "Hello, how are you?",
    });

    await Message.create({
      userId: "usr_01J75RS7MDJV4MWRHE2J9TE4ZM",
      tripId: "trp_01J7E7RF32D1X039XFBZJ0FEM8",
      content: "I'm fine, thank you!",
    });

    await Message.create({
      userId: "usr_01J75RS6Y5XFZ0RXWTRMWX18D7",
      tripId: "trp_01J7E7RF32D1X039XFBZJ0FEM8",
      content: "Whazzup?",
    });
  };
}
