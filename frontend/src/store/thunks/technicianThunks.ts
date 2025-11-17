// store/thunks/technicianThunks.ts
import { createAsyncThunk } from "@reduxjs/toolkit";
import { technicianAPI } from "../../services/common/technicianApi";
import {
  fetchProfileStart,
  fetchProfileSuccess,
  fetchProfileFailure,
} from "../slices/technicianSlice";

export const fetchTechnicianProfile = createAsyncThunk(
  "technician/fetchProfile",
  async (_, { dispatch }) => {
    try {
      dispatch(fetchProfileStart());

      const response = await technicianAPI.getProfile();

      if (response.success && response.data?.profile) {
        dispatch(fetchProfileSuccess(response.data.profile));
        return response.data.profile;
      } else {
        throw new Error(response.message || "Failed to fetch profile");
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      dispatch(fetchProfileFailure(error.message));
      throw error;
    }
  }
);
