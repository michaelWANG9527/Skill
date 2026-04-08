-- ═══════════════════════════════════════════
-- 希微科技销售订单审批系统 - 数据库表结构
-- Database: PostgreSQL
-- ═══════════════════════════════════════════

-- 用户表
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username        VARCHAR(50) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    display_name    VARCHAR(100) NOT NULL,
    role            VARCHAR(30) NOT NULL CHECK (role IN ('sales_vp','rd_vp','gm','admin')),
    phone           VARCHAR(20),
    email           VARCHAR(100),
    is_active       BOOLEAN DEFAULT TRUE,
    last_login_at   TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 订单主表
CREATE TABLE orders (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    erp_order_no            VARCHAR(50) NOT NULL UNIQUE,
    customer_name           VARCHAR(200) NOT NULL,
    customer_code           VARCHAR(50),
    end_customer            VARCHAR(200),
    end_application         VARCHAR(200),
    part_number             VARCHAR(100) NOT NULL,
    quantity                INTEGER NOT NULL,
    unit_price_usd          NUMERIC(12,4) NOT NULL,
    unit_price_cny_tax      NUMERIC(12,4) NOT NULL,
    total_amount_tax        NUMERIC(14,2) NOT NULL,
    gross_margin            NUMERIC(5,2),
    is_special_price        BOOLEAN DEFAULT FALSE,
    payment_terms           VARCHAR(50),
    order_date              DATE,
    required_delivery_date  DATE,
    sales_rep               VARCHAR(100),
    approval_status         VARCHAR(30) DEFAULT 'pending',
    current_approver_role   VARCHAR(30),
    erp_raw_data            JSONB,
    synced_at               TIMESTAMPTZ DEFAULT NOW(),
    created_at              TIMESTAMPTZ DEFAULT NOW(),
    updated_at              TIMESTAMPTZ DEFAULT NOW()
);

-- 审批日志表
CREATE TABLE approval_logs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id        UUID NOT NULL REFERENCES orders(id),
    user_id         UUID NOT NULL REFERENCES users(id),
    action          VARCHAR(20) NOT NULL CHECK (action IN ('submit','approve','reject','escalate','comment')),
    comment         TEXT,
    previous_status VARCHAR(30),
    new_status      VARCHAR(30),
    email_sent      BOOLEAN DEFAULT FALSE,
    email_recipients TEXT[],
    ip_address      INET,
    user_agent      VARCHAR(500),
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 邮件通知记录表
CREATE TABLE email_notifications (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id        UUID NOT NULL REFERENCES orders(id),
    trigger_type    VARCHAR(30) NOT NULL,
    recipients      TEXT[] NOT NULL,
    subject         VARCHAR(300),
    body            TEXT,
    triggered_by    UUID REFERENCES users(id),
    sent_status     VARCHAR(20) DEFAULT 'pending',
    sent_at         TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 登录日志表
CREATE TABLE login_logs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES users(id),
    username        VARCHAR(50) NOT NULL,
    login_result    VARCHAR(20) NOT NULL,
    failure_reason  VARCHAR(100),
    ip_address      INET,
    phone_verified  BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 审批规则表
CREATE TABLE escalation_rules (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rule_name       VARCHAR(100) NOT NULL,
    condition_type  VARCHAR(50) NOT NULL,
    threshold_value NUMERIC(14,2),
    escalate_to     VARCHAR(30) NOT NULL,
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO escalation_rules (rule_name, condition_type, threshold_value, escalate_to) VALUES
    ('特殊价格需总经理审批', 'special_price', NULL, 'gm'),
    ('低毛利需研发副总审批', 'low_margin', 15.00, 'rd_vp'),
    ('大额订单需总经理审批', 'high_amount', 500000.00, 'gm');
