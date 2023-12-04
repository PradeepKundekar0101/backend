import Activity, { IActivity } from "../models/activity";
import AppError from "../utils/AppError";

// Create:
export const createActivity = async (activity: IActivity) => {
  try {
    const newActivity = new Activity(activity);
    await newActivity.save();
    return newActivity;
  } catch (err) {
    throw err;
  }
};

// Get:
export const getActivities = async () => {
  const activities = await Activity.find({});
  return activities;
};
