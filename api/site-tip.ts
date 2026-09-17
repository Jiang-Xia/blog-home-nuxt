/**
 * 关于页赞赏 API：创建意向单 / 查进度 / 公开流水
 * 数据来源：blog-server `/site/tip/*`（pay_order bizType=site_tip）
 */
import request from '~~/api/request';

/** 创建赞赏意向单，返回支付宝拉起链接 */
export const createSiteTipOrder = (payload: {
  amountYuan: number;
  displayName?: string;
  message?: string;
}) => request.post('/site/tip/create', payload);

/** 查询赞赏支付进度（同步支付宝） */
export const getSiteTipStatus = (outTradeNo: string) =>
  request.get('/site/tip/status', { out_trade_no: outTradeNo });

/** 公开已支付赞赏流水 */
export const getSiteTipList = (params?: { page?: number; pageSize?: number }) =>
  request.get('/site/tip/list', params || {});

export interface SiteTipCreateResult {
  outTradeNo: string;
  amountYuan: number;
  displayName: string;
  message: string;
  subject: string;
  scheme: string;
  universalLink: string;
}

export interface SiteTipStatusResult {
  outTradeNo: string;
  status: 'PENDING' | 'PAID' | 'REFUNDED' | 'CLOSED' | 'FAILED';
  amountYuan: number;
  displayName: string;
  message: string;
}

/** 流水项字段由后端组装，勿本地 map 回显 */
export interface SiteTipLedgerItem {
  displayName: string;
  message: string;
  amountYuan: number;
  paidAt: string;
}
