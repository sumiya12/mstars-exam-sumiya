// controllers/calendlyController.js
import axios from "axios";
import {
  createCalendlyEventsService,
  getAllPaidInvitees,
} from "../modules/servises.js";
import { handleResponse } from "../utils/responseHandler.js";
export const getCalendlyUser = async (req, res) => {
  try {
    const response = await axios.get("https://api.calendly.com/users/me", {
      headers: {
        Authorization: `Bearer ${process.env.CALENDLY_TOKEN}`,
      },
    });

    res.status(200).json(response.data);
  } catch (error) {
    console.error("Error fetching Calendly user:", error.message);
    res.status(500).json({ error: "Failed to fetch Calendly user info" });
  }
};

export const getPaidStatus = async (req, res) => {
  try {
    const getPaidStatus = await getAllPaidInvitees(req);
    handleResponse(
      res,
      getPaidStatus,
      "Successfully fetched all warehouse items",
      "Failed to fetch warehouse items"
    );
  } catch (error) {
    console.error("Error fetching Calendly user:", error.message);
    res.status(500).json({ error: "Failed to fetch Calendly user info" });
  }
};

export const createCalendlyEvents = async (req, res) => {
  try {
    const calendlyEvent = await createCalendlyEventsService(req);
    res.status(200).json({
      success: true,
      data: calendlyEvent,
      message: "Canvas created successfully.",
    });
  } catch (error) {
    console.error("Error creating Calendly event:", error.message);
    res.status(500).json({ error: "Failed to create Calendly event" });
  }
};

export const getScheduledEvents = async (req, res) => {
  try {
    // Step 1: Get the current user's URI
    const userRes = await axios.get("https://api.calendly.com/users/me", {
      headers: {
        Authorization: `Bearer ${process.env.CALENDLY_TOKEN}`,
      },
    });

    const userUri = userRes.data.resource.uri;

    // Step 2: Fetch the last 50 scheduled events (most recent first)
    const eventsRes = await axios.get(
      `https://api.calendly.com/scheduled_events?user=${userUri}&count=50&sort=start_time:desc`,
      {
        headers: {
          Authorization: `Bearer ${process.env.CALENDLY_TOKEN}`,
        },
      }
    );

    const events = eventsRes.data.collection;

    // Step 3: Fetch invitees for each event (if Calendly native event)
    const enrichedEvents = await Promise.all(
      events.map(async (event) => {
        if (event.uri) {
          const eventId = event.uri.split("/").pop(); // Extract ID
          try {
            const inviteesRes = await axios.get(
              `https://api.calendly.com/scheduled_events/${eventId}/invitees`,
              {
                headers: {
                  Authorization: `Bearer ${process.env.CALENDLY_TOKEN}`,
                },
              }
            );

            return {
              ...event,
              invitees: inviteesRes.data.collection,
            };
          } catch (err) {
            console.warn(
              `Could not fetch invitees for ${eventId}:`,
              err.message
            );
            return {
              ...event,
              invitees: [],
              inviteeFetchError: err.message,
            };
          }
        }
        return {
          ...event,
          invitees: [],
          note: "Event has no valid URI or invitee data",
        };
      })
    );

    // Step 4: Respond with enriched data
    res.status(200).json({
      total: enrichedEvents.length,
      events: enrichedEvents,
    });
  } catch (error) {
    console.error("Error fetching events:", error.message);
    res.status(500).json({ error: "Failed to fetch scheduled events" });
  }
};

// export const getInviteeQuestions = async (eventUri) => {
//   try {
//     if (typeof eventUri !== "string") {
//       console.error("Expected eventUri to be a string but got:", eventUri);
//       throw new Error("Invalid eventUri");
//     }

//     const eventId = eventUri.split("/").pop(); // get the ID from full URI
//     if (!eventId) throw new Error("Could not extract event ID");

//     const res = await axios.get(
//       `https://api.calendly.com/scheduled_events/${eventId}/invitees`,
//       {
//         headers: {
//           Authorization: `Bearer ${process.env.CALENDLY_TOKEN}`,
//         },
//       }
//     );

//     return res.data.collection.map((invitee) => ({
//       email: invitee.email,
//       name: invitee.name,
//       questionsAndAnswers: invitee.questions_and_answers,
//     }));
//   } catch (error) {
//     console.error(
//       `Error fetching invitees for event ${eventUri}:`,
//       error.message
//     );
//     return [];
//   }
// };

// controllers/calendlyController.js
// export const getInviteesForAllEvents = async (req, res) => {
//   try {
//     const userRes = await axios.get("https://api.calendly.com/users/me", {
//       headers: {
//         Authorization: `Bearer ${process.env.CALENDLY_TOKEN}`,
//       },
//     });

//     const userUri = userRes.data.resource.uri;

//     // Get events
//     const eventsRes = await axios.get(
//       `https://api.calendly.com/scheduled_events?user=${userUri}`,
//       {
//         headers: {
//           Authorization: `Bearer ${process.env.CALENDLY_TOKEN}`,
//         },
//       }
//     );

//     const events = eventsRes.data.collection;

//     // Fetch invitees for each event
//     const inviteesPromises = events.map((event) =>
//       axios.get(`${event.uri}/invitees`, {
//         headers: {
//           Authorization: `Bearer ${process.env.CALENDLY_TOKEN}`,
//         },
//       })
//     );

//     const inviteesResponses = await Promise.all(inviteesPromises);
//     const allInvitees = inviteesResponses.flatMap(
//       (resp) => resp.data.collection
//     );

//     res.status(200).json(allInvitees);
//   } catch (error) {
//     console.error("Error fetching invitees:", error.message);
//     res.status(500).json({ error: "Failed to fetch invitees" });
//   }
// };

// export const getEventsByDate = (startDate, endDate) => async (req, res) => {
//   try {
//     const response = await axios.get(
//       "https://api.calendly.com/scheduled_events",
//       {
//         headers: {
//           Authorization: `Bearer ${process.env.CALENDLY_TOKEN}`,
//         },
//         params: {
//           user: "https://api.calendly.com/users/YOUR_USER_ID",
//           min_start_time: startDate,
//           max_start_time: endDate,
//         },
//       }
//     );

//     return response.data.collection;
//   } catch (err) {
//     console.error("Error getting events by date", err);
//   }
// };
