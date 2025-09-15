// workingSteps.ts
import {
  SearchOutlined,
  CalendarTodayOutlined,
  Person2Outlined,
  ThumbUpOutlined,
} from '@mui/icons-material';
import type { ComponentType } from 'react';

export interface WorkingStep {
  icon: ComponentType; 
  title: string;
  description: string;
}

const workingSteps: WorkingStep[] = [
  {
    icon: SearchOutlined,
    title: 'Select a Service',
    description: 'Choose from our wide range of appliance repair services',
  },
  {
    icon: CalendarTodayOutlined,
    title: 'Book an Appointment',
    description: 'Select a convenient date and time slot for the service',
  },
  {
    icon: Person2Outlined,
    title: 'Expert Technician Visit',
    description: 'Our verified technician will arrive at your doorstep',
  },
  {
    icon: ThumbUpOutlined,
    title: 'Service & Satisfaction',
    description: 'Get your appliance fixed with 30-day service guarantee',
  },
];

export default workingSteps;
