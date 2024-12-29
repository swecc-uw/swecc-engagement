import { devPrint } from '../components/utils/RandomUtils';
import { parseAnyDate, toAPIFormat } from '../localization';
import {
  TechnicalQuestion,
  BehavioralQuestion,
  Topic,
  RawTopic,
  RawTechnicalQuestion,
  RawBehavioralQuestion,
} from '../types';
import api from './api';

export function deserializeTopic({
  topic_id: topicId,
  created_by: createdBy,
  created,
  ...rest
}: RawTopic): Topic {
  return {
    topicId,
    createdBy,
    created: parseAnyDate(created),
    ...rest,
  };
}

export function deserializeBehavioralQuestion({
  question_id: questionId,
  created_by: createdBy,
  approved_by: approvedBy,
  last_assigned: lastAssigned,
  follow_ups: followUps,
  created,
  ...rest
}: RawBehavioralQuestion): BehavioralQuestion {
  return {
    ...rest,
    questionId,
    createdBy,
    approvedBy,
    followUps,
    created: parseAnyDate(created),
    lastAssigned: lastAssigned ? parseAnyDate(lastAssigned) : undefined,
  };
}

export function deserializeTechnicalQuestion({
  question_id: questionId,
  created_by: createdBy,
  approved_by: approvedBy,
  last_assigned: lastAssigned,
  follow_ups: followUps,
  topic,
  created,
  ...rest
}: RawTechnicalQuestion): TechnicalQuestion {
  return {
    ...rest,
    questionId,
    createdBy,
    approvedBy,
    followUps,
    topicName: topic.name || '',
    topic: topic.topic_id || '',
    lastAssigned: lastAssigned ? parseAnyDate(lastAssigned) : undefined,
    created: parseAnyDate(created),
  };
}

export function serializeTopic({
  topicId: topic_id,
  createdBy: created_by,
  created,
  ...topic
}: Partial<Topic>): Partial<RawTopic> {
  return {
    ...topic,
    topic_id,
    created_by,
    created: created ? toAPIFormat(created) : undefined,
  };
}

export function serializeTechnicalQuestion({
  questionId: question_id,
  createdBy: created_by,
  approvedBy: approved_by,
  lastAssigned: last_assigned,
  followUps: follow_ups,
  topic: topic_id,
  created,
  ...question
}: Partial<TechnicalQuestion>): Partial<RawTechnicalQuestion> {
  return {
    ...question,
    question_id,
    follow_ups,
    created_by,
    topic: { topic_id },
    approved_by,
    last_assigned: last_assigned ? toAPIFormat(last_assigned) : undefined,
    created: created ? toAPIFormat(created) : undefined,
  };
}

export function serializeBehavioralQuestion({
  questionId: question_id,
  createdBy: created_by,
  approvedBy: approved_by,
  lastAssigned: last_assigned,
  created,
  ...question
}: Partial<BehavioralQuestion>): Partial<RawBehavioralQuestion> {
  return {
    ...question,
    question_id,
    created_by,
    approved_by,
    last_assigned: last_assigned ? toAPIFormat(last_assigned) : undefined,
    created: created ? toAPIFormat(created) : undefined,
  };
}

// TODO: Implement this endpoint
export async function getTechnicalQuestionsForInterview(
  _interviewId: string
): Promise<TechnicalQuestion[]> {
  return [];
  return new Promise((_resolve, reject) => {
    reject('Not implemented');
  });
}

// TODO: Implement this endpoint
export async function getBehavioralQuestionsForInterview(
  _interviewId: string
): Promise<BehavioralQuestion[]> {
  return [];
  return new Promise((_resolve, reject) => {
    reject('Not implemented');
  });
}

export async function getTechnicalQuestions(): Promise<TechnicalQuestion[]> {
  const url = `/questions/technical/all/`;

  const res = await api.get(url);
  devPrint('res:', res);

  if (res.status !== 200 || !Object.prototype.hasOwnProperty.call(res, 'data'))
    throw new Error('Failed to get questions');

  return res.data.map(deserializeTechnicalQuestion);
}

export async function getBehavioralQuestions(): Promise<BehavioralQuestion[]> {
  const url = `/questions/behavioral/all`;

  const res = await api.get(url);
  devPrint('res:', res);

  if (res.status !== 200 || !Object.prototype.hasOwnProperty.call(res, 'data'))
    throw new Error('Failed to get questions');

  return res.data;
}

export async function getTechnicalQuestion(
  id: string
): Promise<TechnicalQuestion> {
  const url = `/questions/technical/${id}/`;

  const res = await api.get(url);
  devPrint('res:', res);

  if (res.status !== 200 || !Object.prototype.hasOwnProperty.call(res, 'data'))
    throw new Error('Failed to get questions');

  return deserializeTechnicalQuestion(res.data);
}

export async function createTechnicalQuestion(
  question: Partial<TechnicalQuestion>
): Promise<TechnicalQuestion> {
  const url = `/questions/technical/`;
  const { ...rest } = serializeTechnicalQuestion(question);

  const res = await api.post(url, { ...rest, topic: rest.topic?.topic_id });
  devPrint('res:', res);

  if (res.status !== 201 || !Object.prototype.hasOwnProperty.call(res, 'data'))
    throw new Error('Failed to get questions');

  return deserializeTechnicalQuestion(res.data);
}

export async function updateTechnicalQuestion(
  question: Partial<TechnicalQuestion>
): Promise<TechnicalQuestion> {
  const url = `/questions/technical/${question.questionId}/`;

  const { ...rest } = serializeTechnicalQuestion(question);

  const res = await api.put(url, { ...rest, topic: rest.topic?.topic_id });
  devPrint('res:', res);

  if (res.status !== 200 || !Object.prototype.hasOwnProperty.call(res, 'data'))
    throw new Error('Failed to get questions');

  return deserializeTechnicalQuestion(res.data);
}

export async function getTopics(): Promise<Topic[]> {
  const url = `/questions/topics/`;

  const res = await api.get(url);
  devPrint('res:', res);

  if (res.status !== 200 || !Object.prototype.hasOwnProperty.call(res, 'data'))
    throw new Error('Failed to get questions');

  return res.data.map(deserializeTopic);
}

export async function createNewTopic(topicName: string): Promise<Topic> {
  const url = `/questions/topics/`;

  const res = await api.post(url, { name: topicName });
  devPrint('res:', res);

  if (res.status !== 201) throw new Error('Failed to create topic name');

  return deserializeTopic(res.data);
}

export async function updateTechnicalQuestionQueue(
  questionIds: string[]
): Promise<boolean> {
  const url = `/questions/technical/queue/`;
  const body = { question_queue: questionIds };
  const res = await api.put(url, body);
  devPrint('res:', res);

  if (res.status !== 200) throw new Error('Failed to update question queue');

  return true;
}

export async function getTechnicalQuestionQueue(): Promise<string[]> {
  const url = `/questions/technical/queue/`;
  const res = await api.get(url);

  if (res.status !== 200) throw new Error('Failed to get question queue');

  return res.data.question_queue;
}

export async function getBehavioralQuestionQueue(): Promise<string[]> {
  const url = `/questions/behavioral/queue/`;
  const res = await api.get(url);

  if (res.status !== 200)
    throw new Error('Failed to get behavioral question queue');

  return res.data.question_queue;
}

export async function updateBehavioralQuestionQueue(
  questionIds: string[]
): Promise<boolean> {
  const url = `/questions/behavioral/queue/`;
  const body = { question_queue: questionIds };
  const res = await api.put(url, body);

  if (res.status !== 200)
    throw new Error('Failed to update behavioral question queue');

  return true;
}
