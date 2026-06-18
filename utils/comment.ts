/** 评论/回复审核通过后才会在前台展示 */
export const APPROVED_COMMENT_STATUS = 'approved';

type CommentLike = {
  status?: string;
  replys?: Array<{ status?: string }>;
};

/** 过滤待审核、已拒绝的评论及回复，仅保留已通过内容 */
export function filterApprovedComments<T extends CommentLike>(list: T[] | undefined | null): T[] {
  if (!list?.length) {
    return [];
  }

  return list
    .filter(item => item.status === APPROVED_COMMENT_STATUS || item.status == null)
    .map((item) => {
      if (!item.replys?.length) {
        return item;
      }
      return {
        ...item,
        replys: item.replys.filter(
          reply => reply.status === APPROVED_COMMENT_STATUS || reply.status == null,
        ),
      };
    });
}
