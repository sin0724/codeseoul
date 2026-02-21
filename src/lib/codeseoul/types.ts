export type ProfileStatus = 'pending' | 'approved' | 'rejected';
export type CampaignStatus = 'active' | 'closed';
export type ApplicationStatus = 'applied' | 'selected' | 'completed' | 'confirmed' | 'paid';

export interface BankInfo {
  beneficiary_name: string;      // 수취인 영문이름
  address_english: string;       // 영문주소
  phone_number: string;          // 전화번호
  bank_name: string;             // 은행 영문 명칭
  swift_code: string;            // SWIFT 코드(BIC)
  bank_address: string;          // 은행 주소(국가명 포함)
  account_number: string;        // 계좌번호
  iban?: string;                 // 국가별 은행 코드(IBAN)
}

export interface SnsLink {
  label: string;
  url: string;
}

export type ProgramTier = 'INSIDER' | 'OPERATIVE' | 'ELITE' | 'PRESTIGE' | 'AUTHORITY' | 'SOVEREIGN' | 'IMPERIAL' | 'THE ICON';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  sns_link?: string | null;
  sns_links?: SnsLink[];
  follower_count?: number | null;
  tier?: ProgramTier | null;
  tier_requested?: ProgramTier | null;
  tier_requested_at?: string | null;
  line_id?: string | null;
  kakao_id?: string | null;
  bank_info: BankInfo;
  status: ProfileStatus;
  created_at: string;
}

export type FollowerTier = 'under_10k' | '10k_30k' | '30k_50k' | '50k_70k' | '100k_plus';

export interface Campaign {
  id: string;
  title: string;
  brand_name: string;
  guide_content: string | null;
  guide_url: string | null;
  contact_line?: string | null;
  contact_kakao?: string | null;
  payout_amount: number;
  recruitment_quota?: number | null;
  brand_image_url?: string | null;
  follower_tiers?: FollowerTier[];
  deadline: string | null;
  status: CampaignStatus;
  created_at: string;
}

export interface Application {
  id: string;
  kol_id: string;
  campaign_id: string;
  status: ApplicationStatus;
  result_url: string | null;
  applied_at: string;
  campaign?: Campaign;
  profile?: Profile;
}
