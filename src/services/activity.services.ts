import Activity, { IActivity } from "../models/activity.model";

// Create:
export const createActivity = async (activity: IActivity) => {
  const newActivity = new Activity(activity);
  await newActivity.save();
  return newActivity;
};

// Get:
export const getActivities = async () => {
  const activities = await Activity.find({});
  return activities;
};
