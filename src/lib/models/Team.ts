import mongoose, { Schema, Document } from 'mongoose';

export enum Domain {
  CLUB = 'club',
  TECH = 'tech',
  DESIGN = 'design',
  CONTENT_AND_DOCUMENTATION = 'content and documentation',
  PR_AND_MARKETING = 'pr & marketing',
  SOCIAL_MEDIA = 'social media',
  OPERATIONS = 'operations'
}

export enum Tier {
  FACULTY_ADVISOR = 'faculty advisor',
  LEAD = 'lead',
  CO_LEAD = 'co-lead',
  STUDENT_ADVISOR = 'student-advisor',
  MENTOR = 'mentor',
  CORE = 'core',
  MEMBER = 'member',
  PAST = 'past',
  RECRUIT = 'recruit'
}

export interface IMember {
  teamId: string;
  name: string;
  role: string;
  domain: Domain;
  tier: Tier;
  photoUrl: string;
  linkedinUrl?: string;
  githubUrl?: string;
}

export interface ITeam extends Document {
  year: number;
  name: string;
  members: IMember[];
}

const MemberSchema = new Schema<IMember>({
  teamId: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, required: true },
  domain: { 
    type: String,
    required: true,
    enum: Object.values(Domain)
  },
  tier: { 
    type: String,
    required: true,
    enum: Object.values(Tier)
  },
  photoUrl: { type: String },
  linkedinUrl: { type: String },
  githubUrl: { type: String },
});

const TeamSchema = new Schema<ITeam>({
  year: { type: Number, required: true, index: true },
  name: { type: String },
  members: { type: [MemberSchema], default: [] },
});

export default mongoose.models.Team || mongoose.model<ITeam>('Team', TeamSchema);
