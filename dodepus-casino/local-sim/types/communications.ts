export type CommunicationChannel = 'moderators' | 'administrators' | 'staff' | string;

export interface CommunicationThreadRecord {
  id: string;
  channel: CommunicationChannel;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface CommunicationThreadParticipantRecord {
  id: string;
  thread_id: string;
  display_name: string;
  joined_at: string;
}

export interface CommunicationMessageRecord {
  id: string;
  thread_id: string;
  participant_id: string;
  body: string;
  created_at: string;
}
