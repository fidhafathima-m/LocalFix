import { Document, Types } from "mongoose";

export interface ILocationPoint {
  coordinates: [number, number]; // [longitude, latitude]
  timestamp: Date;
  accuracy?: number;
  speed?: number;
  heading?: number;
}

export interface ILocationTracking extends Document {
  technicianId: Types.ObjectId;
  orderId: string;
  locations: ILocationPoint[];
  isActive: boolean;
  startedAt: Date;
  endedAt?: Date;
  lastUpdated: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ILiveLocationData {
  technicianId: string;
  orderId: string;
  location: {
    lat: number;
    lng: number;
    accuracy?: number;
    speed?: number;
    heading?: number;
    timestamp: Date;
  };
}

export interface ITechnicianLocationShare {
  technicianId: string;
  orderId: string;
  location: {
    lat: number;
    lng: number;
    accuracy?: number;
    speed?: number;
    heading?: number;
  };
}