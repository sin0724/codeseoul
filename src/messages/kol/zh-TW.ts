/**
 * KOL 화면용 중국어 번체 메시지
 */

export const zhTW = {
  // 공통
  logout: '登出',
  notifications: '通知',
  markAllRead: '全部已讀',
  noNotifications: '暫無通知',
  justNow: '剛剛',
  minutesAgo: '{n} 分鐘前',
  hoursAgo: '{n} 小時前',

  // 네비
  newMissions: '新任務',
  myMissions: '我的任務',
  appliedMissions: '申請紀錄',
  payoutHistory: '結算紀錄',
  profile: '個人資料',
  tierGuide: '什麼是等級制度？',

  // 로그인/회원가입
  email: '電子郵件',
  password: '密碼',
  login: '登入',
  loggingIn: '登入中...',
  loginFailed: '登入失敗',
  signup: '註冊',
  signingUp: '註冊中...',
  signupFailed: '註冊失敗',
  noAccount: '還沒有帳號？',
  haveAccount: '已有帳號？',
  goToSignup: '前往註冊',
  goToLogin: '前往登入',
  name: '姓名',
  signupSuccess: '註冊已完成，等待審核中。',
  signupSuccessDesc: '首爾總部驗證您的存取代碼後，將以郵件通知您。',
  goToLoginPage: '前往登入',

  // 대기/거절
  waitingTitle: '審核中',
  waitingDesc: '首爾總部正在驗證您的存取代碼。',
  waitingNote: '審核完成後將以郵件通知，請稍候。',
  rejectedTitle: '審核未通過',
  rejectedDesc: '感謝您對 codeseoul 的關注。經審核後，目前暫時無法核准您的申請。',
  rejectedNote: '如有任何疑問或希望重新申請，歡迎隨時與我們的客服團隊聯繫。我們將竭誠為您服務。',
  contactSupport: '聯繫客服',

  // 대시보드 (신규 미션)
  dashboardTitle: '新任務',
  dashboardDesc: '目前進行中的任務列表。',
  noMissions: '暫無進行中的任務。',
  tierUnassigned: '未分配等級',
  deadline: '截止',
  applyEligible: '可申請',
  selectedCount: '入選 {n} 人',
  noLimit: '無限制',

  // 미션 상세
  followerRequirementNotMet: '未達粉絲規模門檻',
  followerRequirementDesc: '此任務僅限 {tiers} 網紅申請。',
  followerRequirementProfile: '請於個人資料中填寫粉絲規模。',
  followerRequirementCurrent: '（目前約 {count}）',
  apply: '申請',
  applying: '申請中...',
  cannotApply: '無法申請',
  applyFailed: '申請失敗',
  submitFailed: '提交失敗',
  appliedTitle: '已完成申請',
  appliedDesc: '請等待入選通知。將依序進行審核，入選者將個別聯絡。',
  appliedLink: '入選者可於「我的任務」中查看。',

  // 내 미션
  noSelectedMissions: '尚無入選任務。',
  noApplications: '尚無申請紀錄。',
  line: 'LINE',
  kakao: 'KakaoTalk',
  copy: '複製',
  viewGuide: '查看指南',
  guideContent: '指南內容',
  postUrlSubmit: '提交貼文網址',
  postUrlPlaceholder: '貼文網址',
  submit: '提交',
  submitting: '提交中...',
  cancel: '取消',
  submittedUrl: '已提交網址',
  close: '關閉',

  // 상태
  statusApplied: '已申請',
  statusSelected: '已入選',
  statusCompleted: '已完成',
  statusConfirmed: '待結算',
  statusPaid: '已匯款',

  // 정산 내역
  payoutTitle: '結算紀錄',
  payoutDesc: '查詢已完成匯款的結算紀錄。',
  totalPaid: '總匯款金額',
  noPayoutHistory: '尚無已完成匯款的結算紀錄。',
  payoutDate: '匯款日期',
  brand: '品牌',
  missionTitle: '任務名稱',
  amount: '金額',

  // 페이지네이션
  paginationCount: '{start}-{end} / {total} 筆',
  prev: '上一頁',
  next: '下一頁',

  // 프로필
  followerCount: '粉絲規模',
  followerPlaceholder: '例：1萬、10000、10k',
  followerNote: '修改粉絲數後，可申請升級至更高等級。',
  tierProgram: '等級制度',
  tierUnassignedLong: '未分配等級',
  upgradePending: '升級審核中：{from} → 等待管理員核准',
  upgradeRequest: '{from} → {to} 申請升級',
  upgradeRequesting: '申請中...',
  saved: '已儲存',
  snsLinks: '社群連結',
  add: '新增',
  delete: '刪除',
  emergencyContact: '緊急聯絡方式',
  lineId: 'LINE ID',
  kakaoId: 'KakaoTalk ID',
  bankInfo: '銀行資訊（外匯匯款用）',
  bankNote: '※ 注意：請務必以英文填寫所有欄位。',
  beneficiaryName: '受款人英文姓名 *',
  addressEnglish: '英文地址 *',
  phoneNumber: '電話號碼 *',
  bankName: '銀行英文名稱 *',
  swiftCode: 'SWIFT 代碼 (BIC) *',
  bankAddress: '銀行地址（含國家） *',
  accountNumber: '帳號 *',
  iban: '國家銀行代碼 (IBAN)',
  save: '儲存',
  saving: '儲存中...',

  // 티어 가이드
  backToList: '返回列表',
  tierGuideDesc: 'codeseoul 依粉絲規模劃分的等級制度。',
  tierOverview: '概要',
  tierOverviewText:
    '等級制度是依 KOL 社群粉絲數授予等級的制度。粉絲增加後可申請升級，部分任務僅限特定等級以上申請。',
  tierStructure: '等級組成',
  tierStructureText: '依粉絲數分為下列 8 個等級。',
  tierPeople: '{n} 人',
  tierAndAbove: ' 以上',
  tierUpgradeMethod: '升級方式',
  tierUpgradeStep1: '於個人資料中正確填寫粉絲規模。（例：1萬、10000、10k）',
  tierUpgradeStep2: '粉絲達更高等級門檻時，會顯示 [申請升級] 按鈕。',
  tierUpgradeStep3: '點擊 [申請升級] 後進入管理員審核階段。',
  tierUpgradeStep4: '管理員審核通過後即完成升級。',
  tierNotes: '注意事項',
  tierNote1: '等級需經管理員核准後生效，核准可能需要時間。',
  tierNote2: '請正確填寫粉絲數，虛報可能導致申請遭拒。',
  tierNote3: '部分任務可能僅限特定等級以上申請。',
  goToProfileForUpgrade: '前往個人資料填寫粉絲數並申請升級 →',

  // AppliedSuccessBanner
  appliedBannerTitle: '申請已受理。',
  appliedBannerDesc: '請等待入選通知。將依序進行審核，入選者將個別聯絡。',
  appliedBannerLink: '入選者可於「我的任務」中查看。',
} as const;

/** 팔로워 티어 라벨 (zh-TW) */
export const followerTierLabels: Record<string, string> = {
  under_10k: '1萬以下',
  '10k_30k': '1-3萬',
  '30k_50k': '3-5萬',
  '50k_70k': '5-7萬',
  '100k_plus': '10萬以上',
};

export function formatFollowerTiersZh(tiers: string[] | null | undefined): string {
  if (!tiers || tiers.length === 0) return zhTW.noLimit;
  return tiers.map((id) => followerTierLabels[id] ?? id).join('、');
}

export function t(key: keyof typeof zhTW, params?: Record<string, string | number>): string {
  let s: string = zhTW[key];
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      s = s.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
    }
  }
  return s;
}
