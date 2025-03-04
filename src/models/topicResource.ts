export interface TopicResource {
  id: string;
  topicId: string;
  url: string;
  description: string;
  type: 'video' | 'article' | 'podcast' | 'audio' | 'image' | 'pdf';
}
