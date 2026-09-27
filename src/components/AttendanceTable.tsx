import React, { useState } from 'react';
import {
  Search,
  Plus,
  Download,
  Upload,
  Edit2,
  Trash2,
  ArrowUpDown,
  UserPlus,
  Filter,
  X,
  Check,
  Calendar,
  ChevronDown,
  ChevronUp,
  History
} from 'lucide-react';
import { Member, SortOption, SemesterInfo, DEFAULT_SEMESTERS } from '../types/attendance';
import { calculateTotalForMonths, sortMembers } from '../utils/helpers';
import { exportToExcel } from '../utils/exportExcel';

interface AttendanceTableProps {
  members: Member[];
  onEditMember: (member: Member) => void;
  onAddMember: () => void;
  onDeleteMember: (id: string) => void;
  onOpenUploader: () => void;
  onOpenRosterImport: () => void;
  onUpdateDays: (memberId: string, month: string, newDays: string) => void;
}

export function AttendanceTable({
  members,
  onEditMember,
  onAddMember,
  onDeleteMember,
  onOpenUploader,
  onOpenRosterImport,
  onUpdateDays
}: AttendanceTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSemesterId, setSelectedSemesterId] = useState<string>('2026-2');
  const [selectedMonth, setSelectedMonth] = useState<string>('전체');
  const [sortOption, setSortOption] = useState<SortOption>('name_asc');
  
  // Global Edit Mode
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [showPastArchives, setShowPastArchives] = useState<boolean>(false);

  const [editingCell, setEditingCell] = useState<{ memberId: string; month: string } | null>(null);
  const [cellValue, setCellValue] = useState('');

  const currentSemesterObj = DEFAULT_SEMESTERS.find((s) => s.id === selectedSemesterId) || DEFAULT_SEMESTERS[0];
  const semesterMonthKeys = currentSemesterObj.months;
  
  // Discover months that actually have data
  const monthsWithData = new Set<string>();
  members.forEach((m) => {
    Object.entries(m.attendances).forEach(([mk, val]) => {
      if (val && val.trim()) monthsWithData.add(mk);
    });
  });

  let displayMonths = semesterMonthKeys.filter(
    (mk) => monthsWithData.has(mk) || mk === '26.9' || mk === '26.10'
  );
  if (displayMonths.length === 0) {
    displayMonths = semesterMonthKeys.slice(0, 4);
  }

  const activeMonths = selectedMonth === '전체' ? displayMonths : [selectedMonth];

  // Filter members based on semester active dates (joinDate & leaveDate)
  const semesterFilteredMembers = members.filter((m) => {
    if (m.joinDate && m.joinDate > currentSemesterObj.endDate) {
      return false; // Member joined after semester ended
    }
    if (m.leaveDate && m.leaveDate < currentSemesterObj.startDate) {
      return false; // Member left before semester started
    }
    return true;
  });

  // Name search filter
  const searchFiltered = semesterFilteredMembers.filter((m) => {
    if (searchTerm.trim() && !m.name.includes(searchTerm.trim())) return false;
    return true;
  });

  // Sort members
  const sortedMembers = sortMembers(searchFiltered, sortOption, activeMonths);

  const handleCellClick = (memberId: string, month: string, currentVal: string) => {
    if (!isEditMode) return;
    setEditingCell({ memberId, month });
    setCellValue(currentVal || '');
  };

  const handleCellSave = () => {
    if (editingCell) {
      onUpdateDays(editingCell.memberId, editingCell.month, cellValue);
      setEditingCell(null);
    }
  };

  const formatMonthHeader = (monthKey: string) => {
    const parts = monthKey.split('.');
    if (parts.length === 2) {
      const monthNum = parseInt(parts[1], 10);
      return `${monthNum}월`;
    }
    return monthKey;
  };

  return (
    <div className="space-y-4">
      {/* Semester Selection Bar & Edit Mode Toggle */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        
        {/* Semester Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 sm:pb-0">
          <span className="text-[11px] font-bold text-slate-400 shrink-0 mr-1 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-slate-500" /> 학기:
          </span>
          {DEFAULT_SEMESTERS.map((sem) => (
            <button
              key={sem.id}
              onClick={() => {
                setSelectedSemesterId(sem.id);
                setSelectedMonth('전체');
              }}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl shrink-0 transition flex items-center gap-1 ${
                selectedSemesterId === sem.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100/80 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <span>{sem.name}</span>
              {sem.isCurrent && (
                <span className="text-[9px] bg-emerald-500 text-white px-1.5 py-0.2 rounded-full font-bold">
                  현재
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Global Edit Mode Toggle */}
        <div className="flex items-center gap-2 justify-end">
          <button
            onClick={() => {
              setIsEditMode(!isEditMode);
              if (isEditMode) setEditingCell(null);
            }}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-xs ${
              isEditMode
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white ring-2 ring-emerald-300'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200/80'
            }`}
          >
            {isEditMode ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>수정 완료</span>
              </>
            ) : (
              <>
                <Edit2 className="w-3.5 h-3.5" />
                <span>수정 모드 켜기</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Controls & Search Bar */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col gap-3">
        
        {/* Prominent Name Search Bar & Actions */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="크루원 이름으로 검색..."
              className="w-full pl-10 pr-9 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:border-slate-900 outline-none transition"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            onClick={() => exportToExcel(sortedMembers, activeMonths)}
            className="px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-xs flex items-center gap-1.5 transition shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            <span>엑셀 다운로드</span>
          </button>
        </div>

        {/* Period Filter & Sort */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100">
          {/* Period Selector */}
          <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200/80 overflow-x-auto max-w-full">
            <span className="text-[11px] text-slate-400 font-medium px-1.5 shrink-0 flex items-center gap-1">
              <Filter className="w-3 h-3 text-slate-400" /> 월별:
            </span>
            <button
              onClick={() => setSelectedMonth('전체')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg shrink-0 transition ${
                selectedMonth === '전체' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600'
              }`}
            >
              전체
            </button>
            {displayMonths.map((m) => (
              <button
                key={m}
                onClick={() => setSelectedMonth(m)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg shrink-0 transition ${
                  selectedMonth === m ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600'
                }`}
              >
                {formatMonthHeader(m)}
              </button>
            ))}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-1 shrink-0">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as SortOption)}
              className="px-3 py-1.5 text-xs border border-slate-200 rounded-xl focus:border-slate-900 outline-none bg-white text-slate-700 font-semibold cursor-pointer"
            >
              <option value="name_asc">가나다순</option>
              <option value="count_desc">출석 많은 순</option>
              <option value="count_asc">출석 적은 순</option>
              <option value="completed">완료 기준 (4회↑)</option>
              <option value="pending">미달 기준 (4회↓)</option>
            </select>
          </div>
        </div>

        {/* Edit Mode Controls */}
        {isEditMode && (
          <div className="flex items-center gap-2 pt-2 border-t border-emerald-100 bg-emerald-50/40 p-2.5 rounded-xl border animate-in fade-in duration-150">
            <span className="text-xs font-bold text-emerald-800 mr-auto flex items-center gap-1">
              ✏️ 수정 모드 작동 중 (셀 클릭 시 즉시 편집 가능)
            </span>

            <button
              onClick={onOpenRosterImport}
              className="py-1.5 px-3 bg-white hover:bg-slate-100 text-slate-800 text-xs font-semibold rounded-lg border border-slate-200 shadow-2xs flex items-center gap-1 transition"
            >
              <UserPlus className="w-3.5 h-3.5 text-slate-600" />
              명단 불러오기
            </button>
            <button
              onClick={onOpenUploader}
              className="py-1.5 px-3 bg-white hover:bg-slate-100 text-slate-800 text-xs font-semibold rounded-lg border border-slate-200 shadow-2xs flex items-center gap-1 transition"
            >
              <Upload className="w-3.5 h-3.5 text-slate-600" />
              카톡 txt 업로드
            </button>
            <button
              onClick={onAddMember}
              className="py-1.5 px-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-2xs flex items-center gap-1 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              크루원 추가
            </button>
          </div>
        )}
      </div>

      {/* ---------------- DUAL STICKY TABLE VIEW (REQUIREMENT 5) ---------------- */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto -webkit-overflow-scrolling-touch">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/90 text-slate-600 font-bold border-b border-slate-200/80">
                <th className="py-3.5 px-3 text-center border-r border-slate-200/60 w-10 text-slate-400">#</th>
                
                {/* 1. Left Sticky Column: Name */}
                <th className="py-3.5 px-4 border-r border-slate-200/80 text-slate-900 sticky left-0 bg-slate-100 z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.08)] min-w-[90px]">
                  이름
                </th>

                {/* 2. Middle Scrollable Month Columns */}
                {selectedMonth === '전체' ? (
                  displayMonths.map((m) => (
                    <th key={m} className="py-3.5 px-4 border-r border-slate-200/60 min-w-[140px]">
                      {formatMonthHeader(m)}
                    </th>
                  ))
                ) : (
                  <th className="py-3.5 px-4 border-r border-slate-200/60 min-w-[220px]">
                    {formatMonthHeader(selectedMonth)} 출석 일자
                  </th>
                )}

                {/* 3. Right Sticky Column: Total Count */}
                <th className="py-3.5 px-4 border-r border-slate-200/80 text-center font-extrabold text-slate-900 w-20 sticky right-[115px] bg-slate-100 z-20 shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                  합계
                </th>

                {/* 4. Right Sticky Column: Status */}
                <th className="py-3.5 px-4 border-r border-slate-200/60 text-center min-w-[115px] sticky right-0 bg-slate-100 z-20 shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.08)]">
                  달성 상태
                </th>

                {/* Edit Column Header */}
                {isEditMode && <th className="py-3.5 px-3 text-center w-16 text-slate-400">삭제</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedMembers.map((member, index) => {
                const totalCount = calculateTotalForMonths(member.attendances, activeMonths);
                const targetCount = member.targetCount || 4;
                const isCompleted = totalCount >= targetCount;

                return (
                  <tr key={member.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="py-3 px-3 text-center text-slate-400 border-r border-slate-100 text-[11px]">
                      {index + 1}
                    </td>

                    {/* Left Sticky Body Cell: Name */}
                    <td className="py-3 px-4 font-extrabold text-slate-900 border-r border-slate-200/80 sticky left-0 bg-white group-hover:bg-slate-50 transition-colors z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.06)]">
                      {member.name}
                    </td>

                    {/* Middle Scrollable Month Cells */}
                    {selectedMonth === '전체' ? (
                      displayMonths.map((mKey) => {
                        const daysValue = member.attendances[mKey] || '';
                        const isEditing = editingCell?.memberId === member.id && editingCell?.month === mKey;

                        return (
                          <td
                            key={mKey}
                            onClick={() => isEditMode && !isEditing && handleCellClick(member.id, mKey, daysValue)}
                            className={`py-3 px-4 border-r border-slate-100 transition text-slate-700 ${
                              isEditMode ? 'cursor-pointer hover:bg-slate-100/80' : ''
                            }`}
                          >
                            {isEditing ? (
                              <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                                <input
                                  type="text"
                                  value={cellValue}
                                  onChange={(e) => setCellValue(e.target.value)}
                                  placeholder="예: 4, 8, 15"
                                  className="w-full px-2 py-1 border border-slate-300 rounded text-xs focus:border-slate-900 outline-none"
                                  autoFocus
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleCellSave();
                                    if (e.key === 'Escape') setEditingCell(null);
                                  }}
                                />
                                <button
                                  onClick={handleCellSave}
                                  className="px-2 py-1 bg-slate-900 text-white text-[11px] font-bold rounded"
                                >
                                  저장
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center justify-between group/cell">
                                <span>{daysValue || <span className="text-slate-300 font-light">-</span>}</span>
                                {isEditMode && (
                                  <Edit2 className="w-3 h-3 text-slate-400 opacity-0 group-hover/cell:opacity-100 transition" />
                                )}
                              </div>
                            )}
                          </td>
                        );
                      })
                    ) : (
                      <td
                        onClick={() => isEditMode && handleCellClick(member.id, selectedMonth, member.attendances[selectedMonth] || '')}
                        className={`py-3 px-4 border-r border-slate-100 transition text-slate-700 ${
                          isEditMode ? 'cursor-pointer hover:bg-slate-100/80' : ''
                        }`}
                      >
                        {editingCell?.memberId === member.id && editingCell?.month === selectedMonth ? (
                          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="text"
                              value={cellValue}
                              onChange={(e) => setCellValue(e.target.value)}
                              placeholder="예: 4, 8, 15"
                              className="w-full px-2 py-1 border border-slate-300 rounded text-xs focus:border-slate-900 outline-none"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleCellSave();
                                if (e.key === 'Escape') setEditingCell(null);
                              }}
                            />
                            <button
                              onClick={handleCellSave}
                              className="px-2 py-1 bg-slate-900 text-white text-[11px] font-bold rounded"
                            >
                              저장
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between group/cell">
                            <span>
                              {member.attendances[selectedMonth] || <span className="text-slate-300 font-light">-</span>}
                            </span>
                            {isEditMode && (
                              <Edit2 className="w-3 h-3 text-slate-400 opacity-0 group-hover/cell:opacity-100 transition" />
                            )}
                          </div>
                        )}
                      </td>
                    )}

                    {/* Right Sticky Body Cell: Total Count */}
                    <td className="py-3 px-4 text-center font-extrabold text-slate-900 border-r border-slate-200/80 sticky right-[115px] bg-slate-50 group-hover:bg-slate-100 transition-colors z-10 shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.05)] text-sm">
                      {totalCount}
                    </td>

                    {/* Right Sticky Body Cell: Status */}
                    <td className="py-3 px-4 border-r border-slate-100 text-center sticky right-0 bg-white group-hover:bg-slate-50 transition-colors z-10 shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.08)]">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-[11px] font-semibold ${
                          isCompleted
                            ? 'bg-slate-900 text-white'
                            : totalCount > 0
                            ? 'bg-slate-100 text-slate-700 border border-slate-200'
                            : 'bg-slate-50 text-slate-400 border border-slate-200/60'
                        }`}
                      >
                        {isCompleted ? `달성 · ${totalCount}회` : `미달 · ${totalCount}/${targetCount}회`}
                      </span>
                    </td>

                    {/* Delete Action (Edit Mode) */}
                    {isEditMode && (
                      <td className="py-3 px-3 text-center border-r border-slate-100">
                        <button
                          onClick={() => {
                            if (confirm(`${member.name} 회원을 삭제하시겠습니까?`)) {
                              onDeleteMember(member.id);
                            }
                          }}
                          className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded transition"
                          title="삭제"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}

              {sortedMembers.length === 0 && (
                <tr>
                  <td colSpan={isEditMode ? 9 : 8} className="py-12 text-center text-slate-400">
                    {searchTerm ? `'${searchTerm}' 이름 검색 결과가 없습니다.` : '해당 학기 크루원 데이터가 없습니다.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Past Semesters Historical Data Accordion */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <button
          onClick={() => setShowPastArchives(!showPastArchives)}
          className="w-full p-4 text-left font-bold text-xs text-slate-700 hover:bg-slate-50 transition flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-slate-500" />
            <span>지난 학기 기록 열람 (과거 데이터 압축됨)</span>
          </div>
          {showPastArchives ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>

        {showPastArchives && (
          <div className="p-4 border-t border-slate-100 bg-slate-50/50 space-y-3 animate-in fade-in duration-200">
            <p className="text-xs text-slate-500">
              과거 학기별 참석 기록입니다. 학기를 선택하시면 해당 학기의 출석 일자를 상세 조회할 수 있습니다.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {DEFAULT_SEMESTERS.filter((s) => s.id !== selectedSemesterId).map((pastSem) => (
                <div
                  key={pastSem.id}
                  onClick={() => {
                    setSelectedSemesterId(pastSem.id);
                    setSelectedMonth('전체');
                  }}
                  className="p-3 bg-white border border-slate-200/80 rounded-xl hover:border-slate-800 cursor-pointer transition flex items-center justify-between"
                >
                  <div>
                    <div className="font-bold text-xs text-slate-900">{pastSem.name}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      포함 월: {pastSem.months.map(formatMonthHeader).join(', ')}
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-1 rounded-lg">
                    조회하기
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
