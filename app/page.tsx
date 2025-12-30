'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import type { Subgroup } from '@/lib/utils';

function RefundForm() {
  const searchParams = useSearchParams();
  const preselectedSubgroup = searchParams.get('subgroup') || '';

  const [formData, setFormData] = useState({
    subgroup: preselectedSubgroup,
    name: '',
    bankName: '',
    accountNumber: '',
    memo: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [subgroups, setSubgroups] = useState<Subgroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load subgroups from API
  useEffect(() => {
    fetch('/api/subgroups')
      .then(res => res.json())
      .then(data => {
        setSubgroups(data.subgroups || []);
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Failed to load subgroups:', err);
        setIsLoading(false);
      });
  }, []);

  // Update subgroup when URL parameter changes or subgroups are loaded
  useEffect(() => {
    if (preselectedSubgroup && subgroups.length > 0) {
      const validSubgroup = subgroups.find(s => s.id === preselectedSubgroup);
      if (validSubgroup) {
        setFormData(prev => ({ ...prev, subgroup: preselectedSubgroup }));
      }
    }
  }, [preselectedSubgroup, subgroups]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.subgroup) {
      setMessage({ type: 'error', text: '소모임을 선택해주세요.' });
      return false;
    }
    if (!formData.name.trim()) {
      setMessage({ type: 'error', text: '신청자 이름을 입력해주세요.' });
      return false;
    }
    if (!formData.bankName.trim()) {
      setMessage({ type: 'error', text: '은행 이름을 입력해주세요.' });
      return false;
    }
    if (!formData.accountNumber.trim()) {
      setMessage({ type: 'error', text: '계좌번호를 입력해주세요.' });
      return false;
    }

    // 계좌번호는 숫자만 허용 (하이픈 제거 후)
    const accountOnly = formData.accountNumber.replace(/-/g, '');
    if (!/^\d+$/.test(accountOnly)) {
      setMessage({ type: 'error', text: '계좌번호는 숫자만 입력해주세요.' });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/refund', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: '환불 신청이 완료되었습니다. 담당자가 확인 후 처리해드리겠습니다.' });
        setFormData({
          subgroup: '',
          name: '',
          bankName: '',
          accountNumber: '',
          memo: '',
        });
      } else {
        setMessage({ type: 'error', text: data.error || '환불 신청 중 오류가 발생했습니다.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: '서버와 통신 중 오류가 발생했습니다.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center shadow-md">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">AWSKRUG</h1>
                <p className="text-sm text-slate-600">환불 신청 시스템</p>
              </div>
            </div>
            <div className="hidden sm:flex items-center space-x-2 text-sm text-slate-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>밋업 참가비 환불 신청</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          {/* Card Header */}
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-8 py-6">
            <h2 className="text-2xl font-bold text-white mb-2">환불 신청서</h2>
            <p className="text-orange-100 text-sm">정확한 정보를 입력해주시면 빠르게 처리해드리겠습니다</p>
          </div>

          {/* Alert Message */}
          {message && (
            <div className={`mx-8 mt-6 p-4 rounded-lg border-l-4 ${
              message.type === 'success'
                ? 'bg-green-50 border-green-500 text-green-800'
                : 'bg-red-50 border-red-500 text-red-800'
            } animate-fade-in`}>
              <div className="flex items-start">
                <svg className={`w-5 h-5 mr-3 mt-0.5 flex-shrink-0 ${
                  message.type === 'success' ? 'text-green-500' : 'text-red-500'
                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {message.type === 'success' ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  )}
                </svg>
                <p className="text-sm font-medium">{message.text}</p>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-8 py-8">
            <div className="space-y-6">
              {/* Subgroup Selection */}
              <div className="form-group">
                <label htmlFor="subgroup" className="block text-sm font-semibold text-slate-700 mb-2">
                  <span className="flex items-center">
                    <svg className="w-5 h-5 mr-2 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    소모임
                    <span className="text-red-500 ml-1">*</span>
                  </span>
                </label>
                {isLoading ? (
                  <div className="flex items-center justify-center py-3 text-slate-500">
                    <svg className="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    로딩 중...
                  </div>
                ) : (
                  <select
                    id="subgroup"
                    name="subgroup"
                    value={formData.subgroup}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all bg-white text-slate-900"
                    required
                  >
                    <option value="">소모임을 선택하세요</option>
                    {subgroups.map((subgroup) => (
                      <option key={subgroup.id} value={subgroup.id}>
                        {subgroup.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Name */}
              <div className="form-group">
                <label htmlFor="name" className="block text-sm font-semibold text-slate-700 mb-2">
                  <span className="flex items-center">
                    <svg className="w-5 h-5 mr-2 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    신청자 이름 (입금하신 이름)
                    <span className="text-red-500 ml-1">*</span>
                  </span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="홍길동"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                  required
                />
              </div>

              {/* Bank Name */}
              <div className="form-group">
                <label htmlFor="bankName" className="block text-sm font-semibold text-slate-700 mb-2">
                  <span className="flex items-center">
                    <svg className="w-5 h-5 mr-2 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    환불 받으실 은행이름
                    <span className="text-red-500 ml-1">*</span>
                  </span>
                </label>
                <input
                  type="text"
                  id="bankName"
                  name="bankName"
                  value={formData.bankName}
                  onChange={handleChange}
                  placeholder="예: 국민은행, 신한은행, 우리은행"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                  required
                />
              </div>

              {/* Account Number */}
              <div className="form-group">
                <label htmlFor="accountNumber" className="block text-sm font-semibold text-slate-700 mb-2">
                  <span className="flex items-center">
                    <svg className="w-5 h-5 mr-2 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    환불 받으실 계좌번호
                    <span className="text-red-500 ml-1">*</span>
                  </span>
                </label>
                <input
                  type="text"
                  id="accountNumber"
                  name="accountNumber"
                  value={formData.accountNumber}
                  onChange={handleChange}
                  placeholder="숫자만 입력 (하이픈 없이)"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                  required
                />
                <p className="mt-2 text-xs text-slate-500 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  하이픈 없이 숫자만 입력해주세요
                </p>
              </div>

              {/* Memo */}
              <div className="form-group">
                <label htmlFor="memo" className="block text-sm font-semibold text-slate-700 mb-2">
                  <span className="flex items-center">
                    <svg className="w-5 h-5 mr-2 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                    </svg>
                    메모 (선택사항)
                  </span>
                </label>
                <textarea
                  id="memo"
                  name="memo"
                  value={formData.memo}
                  onChange={handleChange}
                  placeholder="추가로 전달하실 내용이 있으면 입력해주세요"
                  rows={4}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all resize-none"
                />
                <p className="mt-2 text-xs text-slate-500 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  환불 사유, 연락 가능 시간 등을 입력하실 수 있습니다
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-4 px-6 rounded-lg font-semibold text-white transition-all duration-200 flex items-center justify-center space-x-2 ${
                  isSubmitting
                    ? 'bg-slate-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>처리 중...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>환불 신청하기</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Footer Info */}
        <div className="mt-6 text-center text-sm text-slate-600">
          <p className="flex items-center justify-center space-x-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span>모든 정보는 안전하게 처리됩니다</span>
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-6 border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-2xl mx-auto">
            {/* Contact Info */}
            <div className="bg-slate-50 rounded-lg p-6 mb-6 border border-slate-200">
              <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center justify-center">
                <svg className="w-5 h-5 mr-2 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                AWSKRUG 커뮤니티
              </h3>
              <div className="space-y-3 text-sm text-slate-600">
                <p className="flex items-center justify-center">
                  <svg className="w-4 h-4 mr-2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="font-medium">Meetup:</span>
                  <a
                    href="https://www.meetup.com/awskrug/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-1 text-orange-600 hover:text-orange-700 font-semibold hover:underline"
                  >
                    meetup.com/awskrug
                  </a>
                </p>
                <p className="flex items-center justify-center">
                  <svg className="w-4 h-4 mr-2 text-slate-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M13.5 2c-5.621 0-10.211 4.443-10.475 10h-3.025l5 6.625 5-6.625h-2.975c.257-3.351 3.06-6 6.475-6 3.584 0 6.5 2.916 6.5 6.5s-2.916 6.5-6.5 6.5c-1.863 0-3.542-.793-4.728-2.053l-2.427 3.216c1.877 1.754 4.389 2.837 7.155 2.837 5.79 0 10.5-4.71 10.5-10.5s-4.71-10.5-10.5-10.5z"/>
                  </svg>
                  <span className="font-medium">Slack:</span>
                  <a
                    href="https://awskrug.slack.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-1 text-orange-600 hover:text-orange-700 font-semibold hover:underline"
                  >
                    awskrug.slack.com
                  </a>
                </p>
                <div className="pt-3 border-t border-slate-200">
                  <p className="flex items-center justify-center">
                    <svg className="w-4 h-4 mr-2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>문의사항은 Slack DM으로</span>
                    <span className="ml-1 font-semibold text-orange-600">
                      @{formData.subgroup && subgroups.find(s => s.id === formData.subgroup)?.contactId || 'nalbam'}
                    </span>
                    <span className="ml-1">에게 연락주세요</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Copyright */}
            <div className="text-center text-sm text-slate-600">
              <p>&copy; 2025 AWSKRUG. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
          <p className="mt-4 text-slate-600">로딩 중...</p>
        </div>
      </div>
    }>
      <RefundForm />
    </Suspense>
  );
}
