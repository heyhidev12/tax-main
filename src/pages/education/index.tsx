import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/router';
import Header from '@/components/common/Header';
import Menu from '@/components/Menu';
import Footer from '@/components/Footer';
import PageHeader from '@/components/common/PageHeader';
import FloatingButton from '@/components/common/FloatingButton';
import { TextField } from '@/components/common/TextField';
import Checkbox from '@/components/common/Checkbox';
import Button from '@/components/common/Button';
import Pagination from '@/components/common/Pagination';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import 'swiper/css';
import 'swiper/css/navigation';
import { get, post } from '@/lib/api';
import { API_ENDPOINTS } from '@/config/api';
import type { EducationItem, EducationListResponse, EducationType } from '@/types/education';
import styles from './education.module.scss';

const EducationPage: React.FC = () => {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'education' | 'newsletter'>('education');

  // 뉴스레터 탭 노출 여부
  const [newsletterExposed, setNewsletterExposed] = useState(true);
  const [educationList, setEducationList] = useState<EducationItem[]>([]);
  const [newEducationList, setNewEducationList] = useState<EducationItem[]>([]); // 신규 교육용 별도 목록
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<EducationType | 'ALL'>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [newEducationIndex, setNewEducationIndex] = useState(0);
  
  // Search state for New Education section
  const [newEducationSearchQuery, setNewEducationSearchQuery] = useState('');
  
  // Swiper refs and state
  const newEducationSwiperRef = useRef<SwiperType | null>(null);
  const [newEducationButtonsDisabled, setNewEducationButtonsDisabled] = useState({
    prev: true,
    next: false,
  });
  
  // Newsletter form state
  const [newsletterName, setNewsletterName] = useState('');
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [privacyAgreed, setPrivacyAgreed] = useState(false);
  const [optionalAgreed, setOptionalAgreed] = useState(false);
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 로그인된 사용자 정보로 뉴스레터 폼 미리 채우기
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.name && !newsletterName) {
          setNewsletterName(user.name);
        }
        // email 또는 loginId(이메일 형식인 경우) 사용
        const email = user.email || (user.loginId && user.loginId.includes('@') ? user.loginId : '');
        if (email && !newsletterEmail) {
          setNewsletterEmail(email);
        }
      } catch (e) {
        // 파싱 실패 시 무시
      }
    }
  }, []);

  // 뉴스레터 탭 노출 여부 확인
  useEffect(() => {
    const checkNewsletterExposed = async () => {
      try {
        const response = await get<{ isExposed: boolean }>(API_ENDPOINTS.NEWSLETTER.PAGE);
        if (response.data) {
          setNewsletterExposed(response.data.isExposed);
        } else {
          setNewsletterExposed(false);
        }
      } catch {
        setNewsletterExposed(false);
      }
    };
    checkNewsletterExposed();
  }, []);

  // 뉴스레터 탭이 숨겨진 상태에서 newsletter 탭에 접근하면 education으로 변경
  useEffect(() => {
    if (!newsletterExposed && activeSubTab === 'newsletter') {
      setActiveSubTab('education');
    }
  }, [newsletterExposed, activeSubTab]);

  // Email validation
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  // Handle newsletter subscription
  const handleNewsletterSubmit = async () => {
    // Reset errors
    setNameError('');
    setEmailError('');
    
    // Validate name
    if (!newsletterName.trim()) {
      setNameError('이름을 입력해주세요');
      return;
    }
    
    // Validate email
    if (!newsletterEmail.trim()) {
      setEmailError('이메일을 입력해주세요');
      return;
    }
    
    if (!validateEmail(newsletterEmail)) {
      setEmailError('올바른 이메일 주소를 입력해주세요');
      return;
    }
    
    // Validate privacy agreement
    if (!privacyAgreed) {
      alert('개인정보 처리 방침 이용 동의는 필수입니다.');
      return;
    }
    
    // Prevent double submission
    if (isSubmitting) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await post(
        API_ENDPOINTS.NEWSLETTER.SUBSCRIBE,
        {
          name: newsletterName.trim(),
          email: newsletterEmail.trim(),
        }
      );
      
      if (response.error) {
        alert(response.error || '뉴스레터 구독 중 오류가 발생했습니다.');
        return;
      }
      
      // Success
      alert('뉴스레터 구독이 완료되었습니다.');
      
      // Reset form
      setNewsletterName('');
      setNewsletterEmail('');
      setPrivacyAgreed(false);
      setOptionalAgreed(false);
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      alert('뉴스레터 구독 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Check if form is valid
  const isFormValid = newsletterName.trim() !== '' && 
                      newsletterEmail.trim() !== '' && 
                      validateEmail(newsletterEmail) && 
                      privacyAgreed;

  const subTabItems = [
    { id: 'education', label: '교육/세미나 안내' },
    { id: 'newsletter', label: '뉴스레터' },
  ];

  // 뉴스레터 탭 노출 여부에 따라 탭 필터링
  const filteredSubTabItems = subTabItems.filter(tab => {
    if (tab.id === 'newsletter') return newsletterExposed;
    return true;
  });

  // 신규 교육 목록 가져오기 (필터 무관, 최초 1회)
  useEffect(() => {
    if (activeSubTab === 'education') {
      fetchNewEducationList();
    }
  }, [activeSubTab]);

  const fetchNewEducationList = async () => {
    try {
      const response = await get<EducationListResponse>(
        `${API_ENDPOINTS.TRAINING_SEMINARS}?page=1&limit=9`
      );
      if (response.data) {
        setNewEducationList(response.data.items);
      }
    } catch (err) {
      console.error('신규 교육 목록 로딩 실패:', err);
    }
  };

  // 전체 교육 목록 가져오기 (필터 적용)
  useEffect(() => {
    if (activeSubTab === 'education') {
      setCurrentPage(1); // 타입 변경 시 첫 페이지로 리셋
    }
  }, [activeSubTab, selectedType]);

  useEffect(() => {
    if (activeSubTab === 'education') {
      fetchEducationList();
    }
  }, [activeSubTab, selectedType, currentPage]);

  const fetchEducationList = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '9', // 3x3 그리드를 위한 9개
      });

      if (selectedType !== 'ALL') {
        params.append('type', selectedType);
      }

      const response = await get<EducationListResponse>(
        `${API_ENDPOINTS.TRAINING_SEMINARS}?${params.toString()}`
      );

      if (response.data) {
        setEducationList(response.data.items);
        const limit = 9; // 요청한 limit 사용
        const calculatedTotalPages = Math.ceil(response.data.total / limit);
        setTotalPages(calculatedTotalPages);
        console.log('Education pagination:', {
          total: response.data.total,
          limit,
          totalPages: calculatedTotalPages,
          items: response.data.items.length
        });
      } else if (response.error) {
        setError(response.error);
      }
    } catch (err) {
      setError('데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // Filter new education list based on search query
  const filteredNewEducationList = newEducationList.filter((item) => {
    if (!newEducationSearchQuery.trim()) {
      return true;
    }
    const query = newEducationSearchQuery.toLowerCase();
    return (
      item.name.toLowerCase().includes(query) ||
      item.location?.toLowerCase().includes(query) ||
      item.typeLabel?.toLowerCase().includes(query)
    );
  });

  // Update button states helper for new education swiper
  const updateNewEducationButtons = useCallback(() => {
    if (newEducationSwiperRef.current) {
      setNewEducationButtonsDisabled({
        prev: newEducationSwiperRef.current.isBeginning,
        next: newEducationSwiperRef.current.isEnd,
      });
    }
  }, []);

  // Reset swiper to first slide when search query changes
  useEffect(() => {
    if (newEducationSwiperRef.current) {
      newEducationSwiperRef.current.slideTo(0);
      updateNewEducationButtons();
    }
  }, [newEducationSearchQuery, updateNewEducationButtons]);

  const handleNewEducationPrev = () => {
    newEducationSwiperRef.current?.slidePrev();
  };

  const handleNewEducationNext = () => {
    newEducationSwiperRef.current?.slideNext();
  };

  // 날짜 포맷팅
  const formatDate = (dateString: string) => {
    return dateString.replace(/\./g, '.');
  };

  // 모집 마감일까지 남은 일수 계산
  const getDaysUntilDeadline = (endDate: string) => {
    const today = new Date();
    const deadline = new Date(endDate);
    const diffTime = deadline.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  return (
    <div className={styles.page}>
      <Header variant="white" onMenuClick={() => setIsMenuOpen(true)} isFixed={true} />
      <Menu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      <div className={styles.headerImage}/>
      <div className="container">
        <div className={styles.pageHeaderWrapper}>
          <PageHeader
            // title="교육/세미나"
            breadcrumbs={[{ label: '교육/세미나' }]}
          />
        </div>

        {/* <div className={styles.tabSection}>
          <Tab
            items={filteredSubTabItems}
            activeId={activeSubTab}
            onChange={(tabId) => {
              setActiveSubTab(tabId as 'education' | 'newsletter');
            }}
            style="box"
            size="large"
            showActiveDot={true}
          />
        </div> */}

        {activeSubTab === 'education' && (
          <>
            <div className={styles.heroSection}>
              
              <p className={styles.heroSubtitle}>Education & Seminar</p>
            <div className={styles.heroTitle}>
              <span>기업의 성장</span>을 돕는 <br /> 가장 확실한 방법!
            </div>
            <div className={styles.heroDescriptionText}>
              <p>
                <span>세무법인 함께의</span>
                <span className={styles.boldText}>전문가 교육</span>은 <br />
             
                <span className={styles.boldText}>기업의 성공적인 내일</span>을 만듭니다.
              </p>
            </div>
            </div>
          </>
        )}

        {activeSubTab === 'education' && (
          <div className={styles.content}>
            {loading ? (
              <div className={styles.emptyState}>
                <p>로딩 중...</p>
              </div>
            ) : error ? (
              <div className={styles.emptyState}>
                <p>{error}</p>
              </div>
            ) : (
              <>
                <div className={styles.newSection}>
                  <div className={styles.searchInputWrapper}>
                        <input
                          type="text"
                          placeholder="검색어를 입력해보세요"
                          value={newEducationSearchQuery}
                          onChange={(e) => setNewEducationSearchQuery(e.target.value)}
                          className={styles.newEducationSearchInput}
                        />
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 20 20"
                          fill="none"
                          className={styles.searchIcon}
                        >
                          <path
                            d="M9 17C13.4183 17 17 13.4183 17 9C17 4.58172 13.4183 1 9 1C4.58172 1 1 4.58172 1 9C1 13.4183 4.58172 17 9 17Z"
                            stroke="#717171"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M19 19L14.65 14.65"
                            stroke="#717171"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                  <div className={styles.sectionHeader}>
                    
                    <div className={styles.sectionTitleWrapper}>
                      <h4 className={styles.sectionTitle}>신규 교육</h4>
                    </div>
                    <div className={styles.sectionHeaderRight}>
                      
                      {filteredNewEducationList.length > 0 && (
                        <div className={styles.sectionNav}>
                          <button
                            className={styles.navButton}
                            onClick={handleNewEducationPrev}
                            id="new-education-prev-btn"
                            disabled={newEducationButtonsDisabled.prev}
                          >
                            <img src="/images/common/arrow-icon.svg" alt="" className={styles.navButtonLeft} />
                          </button>
                          <button
                            className={styles.navButton}
                            onClick={handleNewEducationNext}
                            id="new-education-next-btn"
                            disabled={newEducationButtonsDisabled.next}
                          >
                            <img src="/images/common/arrow-icon.svg" alt="" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  {filteredNewEducationList.length > 0 ? (
                    <div className={styles.newEducationSwiperWrapper}>
                      <Swiper
                        modules={[Navigation]}
                        grabCursor={true}
                        allowTouchMove={true}
                        navigation={{
                          prevEl: "#new-education-prev-btn",
                          nextEl: "#new-education-next-btn",
                        }}
                        breakpoints={{
                          0: {
                            slidesPerView: 1.3,
                            spaceBetween: 16,
                          },
                          576: {
                            slidesPerView: 2,
                            spaceBetween: 18,
                          },
                          768: {
                            slidesPerView: 3,
                            spaceBetween: 24,
                          },
                        }}
                        onSwiper={(swiper) => {
                          newEducationSwiperRef.current = swiper;
                          updateNewEducationButtons();
                        }}
                        onSlideChange={() => {
                          updateNewEducationButtons();
                        }}
                        className={styles.newEducationSwiper}
                      >
                        {filteredNewEducationList.map((item) => {
                          const daysLeft = getDaysUntilDeadline(item.recruitmentEndDate);
                          return (
                            <SwiperSlide key={item.id}>
                              <div
                                className={styles.educationCard}
                                onClick={() => router.push(`/education/${item.id}`)}
                              >
                                <div className={styles.cardImage}>
                                  <img src={item.image?.url || '/images/education/default-thumbnail.png'} alt={item.name} />
                                </div>
                                <div className={styles.cardContent}>
                                  <div className={styles.cardLabels}>
                                    {daysLeft > 0 && (
                                      <span className={styles.labelRed}>
                                        신청마감 D-{daysLeft}
                                      </span>
                                    )}
                                    <span className={styles.labelWhite}>
                                      {item.typeLabel}
                                    </span>
                                  </div>
                                  <h3 className={styles.cardTitle}>{item.name}</h3>
                                  <div className={styles.cardInfo}>
                                    <p className={styles.cardLocation}>{item.location}</p>
                                    <div className={styles.cardDateWrapper}>
                                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className={styles.cardDateIcon}>
                                        <path d="M3 2V4M13 2V4M2 6H14M3 2H13C13.5523 2 14 2.44772 14 3V13C14 13.5523 13.5523 14 13 14H3C2.44772 14 2 13.5523 2 13V3C2 2.44772 2.44772 2 3 2Z" stroke="#d8d8d8" strokeWidth="1" strokeLinecap="round"/>
                                      </svg>
                                      <p className={styles.cardDate}>
                                        {item.educationDates[0]} {item.educationTimeSlots[0]}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </SwiperSlide>
                          );
                        })}
                      </Swiper>
                    </div>
                  ) : (
                    <div className={styles.emptyState}>
                      <img src="/images/common/empty-icon.svg" alt="Empty" className={styles.emptyIcon} />
                      <p>등록된 세미나/교육이 없습니다</p>
                    </div>
                  )}
                </div>

                <div className={styles.allSection}>
                  <div className={styles.sectionHeader}>
                    <div className={styles.sectionTitleWrapper}>
                      <h4 className={styles.sectionTitle}>전체 교육</h4>
                    </div>
                  </div>
                  <div className={styles.allContent}>
                    <div className={styles.sidebar}>
                      <div
                        className={`${styles.sidebarTab} ${selectedType === 'ALL' ? styles.sidebarTabActive : ''}`}
                        onClick={() => setSelectedType('ALL')}
                      >
                        <span>전체</span>
                      </div>
                      <div
                        className={`${styles.sidebarTab} ${selectedType === 'VOD' ? styles.sidebarTabActive : ''}`}
                        onClick={() => setSelectedType('VOD')}
                      >
                        <span>VOD</span>
                      </div>
                      <div
                        className={`${styles.sidebarTab} ${selectedType === 'TRAINING' ? styles.sidebarTabActive : ''}`}
                        onClick={() => setSelectedType('TRAINING')}
                      >
                        <span>교육</span>
                      </div>
                      <div
                        className={`${styles.sidebarTab} ${selectedType === 'LECTURE' ? styles.sidebarTabActive : ''}`}
                        onClick={() => setSelectedType('LECTURE')}
                      >
                        <span>강연</span>
                      </div>
                      <div
                        className={`${styles.sidebarTab} ${selectedType === 'SEMINAR' ? styles.sidebarTabActive : ''}`}
                        onClick={() => setSelectedType('SEMINAR')}
                      >
                        <span>세미나</span>
                      </div>
                    </div>
                    <div className={styles.mainContent}>
                      {educationList.length > 0 ? (
                        <>
                          <div className={styles.educationGrid}>
                            {educationList.map((item) => {
                              const daysLeft = getDaysUntilDeadline(item.recruitmentEndDate);
                              return (
                                <div
                                  key={item.id}
                                  className={styles.educationCard}
                                  onClick={() => router.push(`/education/${item.id}`)}
                                >
                                  <div className={styles.cardImage}>
                                    <img src={item.image?.url || '/images/education/default-thumbnail.png'} alt={item.name} />
                                  </div>
                                  <div className={styles.cardContent}>
                                    <div className={styles.cardLabels}>
                                      {daysLeft > 0 ? (
                                        <span className={styles.labelRed}>
                                          신청마감 D-{daysLeft}
                                        </span>
                                      ) : (
                                        <span className={styles.labelGray}>
                                          신청마감
                                        </span>
                                      )}
                                      <span className={styles.labelWhite}>
                                        {item.typeLabel}
                                      </span>
                                    </div>
                                    <h3 className={styles.cardTitle}>{item.name}</h3>
                                    <div className={styles.cardInfo}>
                                      <p className={styles.cardLocation}>{item.location}</p>
                                      <div className={styles.cardDateWrapper}>
                                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className={styles.cardDateIcon}>
                                          <path d="M3 2V4M13 2V4M2 6H14M3 2H13C13.5523 2 14 2.44772 14 3V13C14 13.5523 13.5523 14 13 14H3C2.44772 14 2 13.5523 2 13V3C2 2.44772 2.44772 2 3 2Z" stroke="#d8d8d8" strokeWidth="1" strokeLinecap="round"/>
                                        </svg>
                                        <p className={styles.cardDate}>
                                          {item.educationDates[0]} {item.educationTimeSlots[0]}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                          <div className={styles.paginationWrapper}>
                            <Pagination
                              currentPage={currentPage}
                              totalPages={totalPages}
                              onPageChange={(page) => {
                                setCurrentPage(page);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              }}
                              visiblePages={4}
                            />
                          </div>
                        </>
                      ) : (
                        <div className={styles.emptyState}>
                          <img src="/images/common/empty-icon.svg" alt="Empty" className={styles.emptyIcon} />
                          <p>등록된 세미나/교육이 없습니다</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {activeSubTab === 'newsletter' && (
          <div className={styles.newsletterSection}>
            <div className={styles.newsletterHero}>
               <p className={styles.newsletterLabel}>NEWSLETTER</p>
                <h2 className={styles.newsletterTitle}>뉴스레터</h2>
              <div className={styles.newsletterHeroContent}>
                <div className={styles.newsletterLeft}>
                 
                  <img src="/images/pages/newsletter.png" alt="" />
                </div>
                <div className={styles.newsletterRight}>
                <div className={styles.newsletterRighTitle}>
                  <p>Newsletter</p>
                  <h2>알면 이익이 되는 세무 정보, <br /> 구독하고 빠르게 전달 받으세요</h2>
                  </div>
                  <div className={styles.newsletterForm}>
                    <div className={styles.newsletterFormFields}>
                      <TextField
                        variant="line"
                        label="이름"
                        required
                        placeholder="수신자 명"
                        value={newsletterName}
                        onChange={(value) => {
                          setNewsletterName(value);
                          if (nameError) setNameError('');
                        }}
                        error={!!nameError}
                        errorMessage={nameError}
                        fullWidth
                        className={styles.newsletterTextField}
                      />
                      <TextField
                        variant="line"
                        label="이메일"
                        required
                        type="email"
                        placeholder="뉴스레터를 받을 이메일 주소"
                        value={newsletterEmail}
                        onChange={(value) => {
                          setNewsletterEmail(value);
                          if (emailError) setEmailError('');
                        }}
                        error={!!emailError}
                        errorMessage={emailError}
                        fullWidth
                        className={styles.newsletterTextField}
                      />
                    </div>
                    <div className={styles.newsletterCheckboxes}>
                      <div className={styles.newsletterCheckboxRow}>
                        <Checkbox
                          variant="square"
                          checked={privacyAgreed}
                          onChange={setPrivacyAgreed}
                          label="[필수] 개인정보 처리 방침 이용 동의"
                        />
                        <button className={styles.newsletterLink}>보기</button>
                      </div>
                      <div className={styles.newsletterCheckboxRow}>
                        <Checkbox
                          variant="square"
                          checked={optionalAgreed}
                          onChange={setOptionalAgreed}
                          label="[선택] OO OOOOO 이용 동의"
                        />
                        <button className={styles.newsletterLink}>보기</button>
                      </div>
                    </div>
                    <Button
                      type="primary"
                      size="large"
                      fullWidth
                      disabled={!isFormValid || isSubmitting}
                      onClick={handleNewsletterSubmit}
                      className={styles.newsletterButton}
                    >
                      {isSubmitting ? '구독 중...' : '구독하기'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />

      {/* Floating Buttons */}
      <div className={styles.floatingButtons}>
        <FloatingButton
          variant="consult"
          label="상담 신청하기"
          onClick={() => router.push('/consultation/apply')}
        />
        <FloatingButton
          variant="top"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        />
      </div>
    </div>
  );
};

export default EducationPage;

