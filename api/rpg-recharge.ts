import request from '~~/api/request';
import { afterRpgMutation } from '~~/api/rpg-inflight';

/** 创建 RPG 充值订单，返回动态拉起链接 */
export const createRpgRechargeOrder = (amountYuan: number) =>
  request.post('/rpg/recharge/create', { amountYuan });

/** 查询充值进度（服务端同步支付宝；弹窗不再轮询，仅 WS / 管理端手工补钻） */
export const getRpgRechargeStatus = (outTradeNo: string) =>
  afterRpgMutation(['status'], () =>
    request.get('/rpg/recharge/status', { out_trade_no: outTradeNo }),
  );

export interface RpgRechargeCreateResult {
  outTradeNo: string;
  amountYuan: number;
  diamonds: number;
  rateText: string;
  scheme: string;
  universalLink: string;
}

export interface RpgRechargeStatusResult {
  outTradeNo: string;
  status: 'PENDING' | 'PAID' | 'REFUNDED' | 'CLOSED' | 'FAILED';
  amountYuan: number;
  diamonds: number;
  fulfilled: boolean;
  balance?: number;
  tradeNo?: string;
}
