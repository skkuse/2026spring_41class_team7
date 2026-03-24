export type ExampleResponse = {
  message: string;
};

export type HealthOkResponse = {
  status: 'ok';
  service: 'api';
};

export type HealthErrorResponse = {
  status: 'error';
  message: string;
};
