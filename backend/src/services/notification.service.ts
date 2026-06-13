import axios from 'axios';
import { oneSignalConfig } from '../config/onesignal';

export class NotificationService {

  async sendToAll(
    title: string,
    message: string,
  ) {

    try {

      const response = await axios.post(
        'https://api.onesignal.com/notifications',
        {
          app_id: oneSignalConfig.appId,

          included_segments: ['All'],

          headings: {
            en: title,
          },

          contents: {
            en: message,
          },
        },
        {
          headers: {
            Authorization:
              `Key ${oneSignalConfig.apiKey}`,
            'Content-Type':
              'application/json',
          },
        },
      );

      console.log(response.data);

      return response.data;

    } catch (error: any) {

      console.log(
        'ONESIGNAL ERROR:',
        error.response?.data
      );

      throw error;
    }
  }
}