// controllers/calendlyController.js
import axios from "axios";

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

export const getScheduledEvents = async (req, res) => {
  try {
    // First, get the user URI
    const userRes = await axios.get("https://api.calendly.com/users/me", {
      headers: {
        Authorization: `Bearer ${process.env.CALENDLY_TOKEN}`,
      },
    });

    const userUri = userRes.data.resource.uri;

    // Then, get the events
    const eventsRes = await axios.get(
      `https://api.calendly.com/scheduled_events?user=${userUri}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.CALENDLY_TOKEN}`,
        },
      }
    );

    res.status(200).json(eventsRes.data);
  } catch (error) {
    console.error("Error fetching scheduled events:", error.message);
    res.status(500).json({ error: "Failed to fetch scheduled events" });
  }
};

// controllers/calendlyController.js
export const getInviteesForAllEvents = async (req, res) => {
  try {
    const userRes = await axios.get("https://api.calendly.com/users/me", {
      headers: {
        Authorization: `Bearer ${process.env.CALENDLY_TOKEN}`,
      },
    });

    const userUri = userRes.data.resource.uri;

    // Get events
    const eventsRes = await axios.get(
      `https://api.calendly.com/scheduled_events?user=${userUri}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.CALENDLY_TOKEN}`,
        },
      }
    );

    const events = eventsRes.data.collection;

    // Fetch invitees for each event
    const inviteesPromises = events.map((event) =>
      axios.get(`${event.uri}/invitees`, {
        headers: {
          Authorization: `Bearer ${process.env.CALENDLY_TOKEN}`,
        },
      })
    );

    const inviteesResponses = await Promise.all(inviteesPromises);
    const allInvitees = inviteesResponses.flatMap(
      (resp) => resp.data.collection
    );

    res.status(200).json(allInvitees);
  } catch (error) {
    console.error("Error fetching invitees:", error.message);
    res.status(500).json({ error: "Failed to fetch invitees" });
  }
};


export const getEventsByDate = (startDate, endDate) => async (req, res) => {
  try {
    const response = await axios.get(
      "https://api.calendly.com/scheduled_events",
      {
        headers: {
          Authorization: `Bearer ${process.env.CALENDLY_TOKEN}`,
        },
        params: {
          user: "https://api.calendly.com/users/YOUR_USER_ID",
          min_start_time: startDate,
          max_start_time: endDate,
        },
      }
    );

    return response.data.collection;
  } catch (err) {
    console.error("Error getting events by date", err);
  }
};
