/**
 * 站内通知 API（导航栏铃铛 + 下拉列表）
 */
import request from '~~/api/request';

/** 通知列表；payload 由后端 JSON 解析后下发 */
export const getNotifications = (params: { page?: number; pageSize?: number } = {}) => {
  return request.get('/notification/list', params);
};

/** 未读数量；登录时拉一次，平时由 WebSocket siteNotification 更新 */
export const getUnreadNotificationCount = () => {
  return request.get('/notification/unread-count');
};

/** 标记已读；不传 id 则全部已读 */
export const markNotificationsRead = (id?: number) => {
  const qs = id ? `?id=${id}` : '';
  return request.patch(`/notification/read${qs}`, {});
};
