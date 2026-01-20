{activeTab === "library" && (
              <div className={styles.libraryContent}>
                

                <div className={styles.libraryTitleSection}>
                  <h2 className={styles.libraryTitle}>
                    ARCHIVES A
                  </h2>
                </div>
                <div className={styles.libraryMainContent}>
                  <div className={styles.librarySidebar}>
                    <h2 className={styles.librarySidebarTitle}>
                      자료실A
                    </h2>
                    <nav className={styles.libraryCategoryNav}>
                      <button
                        className={`${styles.libraryCategoryItem} ${categoryFilter === "all"
                          ? styles.libraryCategoryItemActive
                          : ""
                          }`}
                        onClick={() => handleCategoryChange("all")}
                      >
                        {categoryFilter === "all" && (
                          <span className={styles.activeDot} />
                        )}
                        <span>전체</span>
                      </button>
                      <button
                        className={`${styles.libraryCategoryItem} ${categoryFilter === "industry"
                          ? styles.libraryCategoryItemActive
                          : ""
                          }`}
                        onClick={() => handleCategoryChange("industry")}
                      >
                        {categoryFilter === "industry" && (
                          <span className={styles.activeDot} />
                        )}
                        <span>업종별</span>
                      </button>
                      <button
                        className={`${styles.libraryCategoryItem} ${categoryFilter === "consulting"
                          ? styles.libraryCategoryItemActive
                          : ""
                          }`}
                        onClick={() => handleCategoryChange("consulting")}
                      >
                        {categoryFilter === "consulting" && (
                          <span className={styles.activeDot} />
                        )}
                        <span>컨설팅</span>
                      </button>
                    </nav>
                  </div>

                  <div className={styles.libraryMainSection}>
                    <div className={styles.libraryToolbar}>
                      <div className={styles.count}>
                        <span>총 </span>
                        <span className={styles.countNumber}>{total}</span>
                        <span> 개의 게시물이 있습니다</span>
                      </div>
                      <div className={styles.searchWrapper}>
                        <SearchField
                          placeholder="제목을 입력해주세요"
                          value={searchQuery}
                          onChange={handleSearchChange}
                          onSearch={handleSearch}
                          fullWidth
                        />
                      </div>
                    </div>

                    {libraryDisplayType !== "list" && (
                      <div className={styles.divider} />
                    )}

                    {error ? (
                      <div className={styles.error}>
                        <div className={styles.errorIcon}>⚠️</div>
                        <p>{error}</p>
                      </div>
                    ) : insights.length === 0 ? (
                      <div className={styles.empty}>
                        <p>등록된 게시글이 없습니다.</p>
                      </div>
                    ) : (
                      <>
                        {libraryDisplayType === "gallery" && (
                          <div className={styles.libraryGallery}>
                            {insights.map((item) => (
                              <div
                                key={item.id}
                                className={`${styles.libraryCard} ${item.isMainExposed
                                  ? styles.libraryCardFeatured
                                  : ""
                                  }`}
                                onClick={() => handleItemClick(item.id)}
                              >
                                <div className={styles.libraryCardImage}>
                                  {item.thumbnail?.url ? (
                                    <img
                                      src={item.thumbnail.url}
                                      alt={item.title}
                                    />
                                  ) : (
                                    <div className={styles.placeholderImage} />
                                  )}
                                </div>
                                <div className={styles.libraryCardContent}>
                                  <div className={styles.libraryCardHeader}>
                                    <p className={styles.libraryCardCategory}>
                                      {typeof item.subcategory?.name ===
                                        "string"
                                        ? item.subcategory.name
                                        : typeof item.category?.name ===
                                          "string"
                                          ? item.category.name
                                          : "카테고리명"}
                                    </p>
                                    <h3 className={styles.libraryCardTitle}>
                                      {item.title}
                                    </h3>
                                  </div>
                                  <div className={styles.libraryCardFooter}>
                                    <span className={styles.libraryCardAuthor}>
                                      작성자명
                                    </span>
                                    <span className={styles.cardDivider} />
                                    <span className={styles.libraryCardDate}>
                                      {item.createdAt
                                        ? formatDate(item.createdAt)
                                        : "2026.01.28"}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {libraryDisplayType === "snippet" && (
                          <div className={styles.libraryGallery}>
                            {insights.map((item) => {
                              // content에서 마크다운 제거하고 텍스트만 추출
                              const plainContent = item.content
                                .replace(/```[\s\S]*?```/g, "") // 코드 블록 제거
                                .replace(/#{1,6}\s+/g, "") // 헤더 제거
                                .replace(/\*\*([^*]+)\*\*/g, "$1") // 볼드 제거
                                .replace(/\*([^*]+)\*/g, "$1") // 이탤릭 제거
                                .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // 링크 제거
                                .trim();

                              return (
                                <div
                                  key={item.id}
                                  className={`${styles.libraryCard} ${styles.libraryCardTransparent
                                    } ${item.isMainExposed
                                      ? styles.libraryCardFeatured
                                      : ""
                                    }`}
                                  onClick={() => handleItemClick(item.id)}
                                >
                                  <div className={styles.libraryCardImage}>
                                    {item.thumbnail?.url ? (
                                      <img
                                        src={item.thumbnail.url}
                                        alt={item.title}
                                      />
                                    ) : (
                                      <div
                                        className={styles.placeholderImage}
                                      />
                                    )}
                                  </div>
                                  <div className={styles.libraryCardContent}>
                                    <div className={styles.libraryCardHeader}>
                                      <p className={styles.libraryCardCategory}>
                                        {typeof item.subcategory?.name ===
                                          "string"
                                          ? item.subcategory.name
                                          : typeof item.category?.name ===
                                            "string"
                                            ? item.category.name
                                            : "카테고리명"}
                                      </p>
                                      <h3
                                        className={
                                          styles.libraryCardTitleSingle
                                        }
                                      >
                                        {item.title}
                                      </h3>
                                      <p
                                        className={
                                          styles.libraryCardDescription
                                        }
                                      >
                                        {plainContent}
                                      </p>
                                    </div>
                                    <div className={styles.libraryCardFooter}>
                                      <span
                                        className={styles.libraryCardAuthor}
                                      >
                                        작성자명
                                      </span>
                                      <span className={styles.cardDivider} />
                                      <span className={styles.libraryCardDate}>
                                        {item.createdAt
                                          ? formatDate(item.createdAt)
                                          : "2026.01.28"}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {libraryDisplayType === "list" && (
                          <div className={styles.libraryList}>
                            {/* 데스크톱 헤더 */}
                            <div className={styles.libraryListHeader}>
                              <div className={styles.libraryListHeaderRow}>
                                <div className={styles.libraryListHeaderCell}>
                                  No.
                                </div>
                                <div
                                  className={`${styles.libraryListHeaderCell} ${styles.sortable}`}
                                  onClick={() => handleSort("category")}
                                >
                                  카테고리
                                  <Icon
                                    type={
                                      sortField === "category" &&
                                        sortOrder === "asc"
                                        ? "arrow-up"
                                        : "arrow-down"
                                    }
                                    size={16}
                                    className={styles.sortIcon}
                                  />
                                </div>
                                <div className={styles.libraryListHeaderCell}>
                                  제목
                                </div>
                                <div
                                  className={`${styles.libraryListHeaderCell} ${styles.sortable}`}
                                  onClick={() => handleSort("author")}
                                >
                                  작성자
                                  <Icon
                                    type={
                                      sortField === "author" &&
                                        sortOrder === "asc"
                                        ? "arrow-up"
                                        : "arrow-down"
                                    }
                                    size={16}
                                    className={styles.sortIcon}
                                  />
                                </div>
                                <div className={styles.libraryListHeaderCell}>
                                  작성 일
                                </div>
                                <div className={styles.libraryListHeaderCell}>
                                  조회수
                                </div>
                              </div>
                            </div>

                            {/* 모바일 헤더 */}
                            <div className={styles.mobileListHeader}>
                              <div
                                className={`${styles.mobileListHeaderCell} ${styles.sortable}`}
                                onClick={() => handleSort("category")}
                              >
                                카테고리
                                <Icon
                                  type={
                                    sortField === "category" &&
                                      sortOrder === "asc"
                                      ? "arrow-up"
                                      : "arrow-down"
                                  }
                                  size={16}
                                  className={styles.sortIcon}
                                />
                              </div>
                              <div
                                className={`${styles.mobileListHeaderCell} ${styles.sortable}`}
                                onClick={() => handleSort("author")}
                              >
                                작성자
                                <Icon
                                  type={
                                    sortField === "author" &&
                                      sortOrder === "asc"
                                      ? "arrow-up"
                                      : "arrow-down"
                                  }
                                  size={16}
                                  className={styles.sortIcon}
                                />
                              </div>
                            </div>

                            {/* 데스크톱 바디 */}
                            <div className={styles.libraryListBody}>
                              {getSortedInsights().map((item, index) => (
                                <div
                                  key={item.id}
                                  className={styles.libraryListRow}
                                  onClick={() => handleItemClick(item.id)}
                                >
                                  <div className={styles.libraryListCell}>
                                    {(currentPage - 1) * 9 + index + 1}
                                  </div>
                                  <div
                                    className={`${styles.libraryListCell} ${styles.categoryCell}`}
                                  >
                                    {typeof item.subcategory?.name === "string"
                                      ? item.subcategory.name
                                      : typeof item.category?.name === "string"
                                        ? item.category.name
                                        : "카테고리 명"}
                                  </div>
                                  <div
                                    className={`${styles.libraryListCell} ${styles.titleCell}`}
                                  >
                                    <span className={styles.libraryListTitle}>
                                      {item.title}
                                    </span>
                                  </div>
                                  <div className={styles.libraryListCell}>
                                    작성자명
                                  </div>
                                  <div className={styles.libraryListCell}>
                                    {item.createdAt
                                      ? formatDate(item.createdAt)
                                      : "2025.10.14 13:05"}
                                  </div>
                                  <div className={styles.libraryListCell}>
                                    0
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* 모바일 바디 */}
                            <div className={styles.mobileListBody}>
                              {getSortedInsights().map((item, index) => (
                                <div
                                  key={item.id}
                                  className={styles.mobileListRow}
                                  onClick={() => handleItemClick(item.id)}
                                >
                                  <div className={styles.mobileListRowTop}>
                                    <span className={styles.mobileListCategory}>
                                      {typeof item.subcategory?.name ===
                                        "string"
                                        ? item.subcategory.name
                                        : typeof item.category?.name ===
                                          "string"
                                          ? item.category.name
                                          : "카테고리 명"}
                                    </span>
                                    <span className={styles.mobileListDate}>
                                      {item.createdAt
                                        ? formatDate(item.createdAt)
                                        : "2025.06.08"}
                                    </span>
                                  </div>
                                  <div className={styles.mobileListTitle}>
                                    {item.title}
                                  </div>
                                  <div className={styles.mobileListAuthor}>
                                    작성자명
                                  </div>
                                  <div className={styles.mobileListBottom}>
                                    <span className={styles.mobileListNo}>
                                      NO.{(currentPage - 1) * 9 + index + 1}
                                    </span>
                                    <span className={styles.mobileListViews}>
                                      <img
                                        src="/images/insights/icons/eye.svg"
                                        alt="조회수"
                                        className={styles.mobileListEyeIcon}
                                      />
                                      0
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className={styles.paginationWrapper}>
                          <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                            visiblePages={4}
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}