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
  LayoutGrid,
  Table as TableIcon
} from 'lucide-react';
import { Member, SortOption } from '../types/attendance';
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
  const [selectedMonth, setSelectedMonth] = useState<string>('전체');
  const [sortOption, setSortOption] = useState<SortOption>('name_asc');
  const [viewMode, setViewMode] = useState<'table' | 'card'>('card'); // Default mobile-friendly card mode
  const [editingCell, setEditingCell] = useState<{ memberId: string; month: string } | null>(null);
  const [cellValue, setCellValue] = useState('');

  const months = ['26.9', '26.10', '26.11', '26.12'];
  const activeMonths = selectedMonth === '전체' ? months : [selectedMonth];

  // Search filter
  const searchFiltered = members.filter((m) => {
    if (searchTerm && !m.name.includes(searchTerm)) return false;
    return true;
  });

  // Sort
  const sortedMembers = sortMembers(searchFiltered, sortOption, activeMonths);

  const handleCellClick = (memberId: string, month: string, currentVal: string) => {
    setEditingCell({ memberId, month });
    setCellValue(currentVal || '');
  };

  const handleCellSave = () => {
    if (editingCell) {
      onUpdateDays(editingCell.memberId, editingCell.month, cellValue);
      setEditingCell(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col gap-3">
        
        {/* Top Actions & Mobile View Switcher */}
        <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
          {/* View Mode Toggle (Card vs Table) */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('card')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition flex items-center gap-1.5 ${
                viewMode === 'card' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>카드 뷰</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition flex items-center gap-1.5 ${
                viewMode === 'table' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>테이블 뷰</span>
            </button>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => exportToExcel(sortedMembers, activeMonths)}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-xs flex items-center gap-1 transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">엑셀 다운로드</span>
              <span className="sm:hidden">엑셀</span>
            </button>
            <button
              onClick={onAddMember}
              className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl border border-slate-200 transition"
              title="크루원 추가"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative flex-1 min-w-[140px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="이름 검색..."
              className="w-full pl-8 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-slate-900 outline-none transition"
            />
          </div>

          {/* Period Selector */}
          <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200/80 overflow-x-auto max-w-full">
            <span className="text-[11px] text-slate-400 font-medium px-1.5 shrink-0 flex items-center gap-1">
              <Filter className="w-3 h-3 text-slate-400" /> 기간:
            </span>
            <button
              onClick={() => setSelectedMonth('전체')}
              className={`px-2 py-1 text-xs font-semibold rounded-lg shrink-0 transition ${
                selectedMonth === '전체' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600'
              }`}
            >
              전체
            </button>
            {months.map((m) => (
              <button
                key={m}
                onClick={() => setSelectedMonth(m)}
                className={`px-2 py-1 text-xs font-semibold rounded-lg shrink-0 transition ${
                  selectedMonth === m ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600'
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-1 shrink-0">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as SortOption)}
              className="px-2.5 py-2 text-xs border border-slate-200 rounded-xl focus:border-slate-900 outline-none bg-white text-slate-700 font-semibold cursor-pointer"
            >
              <option value="name_asc">가나다순</option>
              <option value="count_desc">출석 많은 순</option>
              <option value="count_asc">출석 적은 순</option>
              <option value="completed">완료 기준 (4회↑)</option>
              <option value="pending">미달 기준 (4회↓)</option>
            </select>
          </div>
        </div>

        {/* Sub import buttons */}
        <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
          <button
            onClick={onOpenRosterImport}
            className="flex-1 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-medium rounded-xl border border-slate-200/60 flex items-center justify-center gap-1 transition"
          >
            <UserPlus className="w-3.5 h-3.5 text-slate-500" />
            전체 명단 불러오기
          </button>
          <button
            onClick={onOpenUploader}
            className="flex-1 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-medium rounded-xl border border-slate-200/60 flex items-center justify-center gap-1 transition"
          >
            <Upload className="w-3.5 h-3.5 text-slate-500" />
            카톡 txt 불러오기
          </button>
        </div>
      </div>

      {/* ---------------- CARD VIEW (MOBILE OPTIMIZED) ---------------- */}
      {viewMode === 'card' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {sortedMembers.map((member, index) => {
            const totalCount = calculateTotalForMonths(member.attendances, activeMonths);
            const targetCount = member.targetCount || 4;
            const isCompleted = totalCount >= targetCount;

            return (
              <div
                key={member.id}
                className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-slate-400 transition"
              >
                <div>
                  {/* Card Header: Name & Status Badge */}
                  <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-400">#{index + 1}</span>
                      <span className="text-base font-extrabold text-slate-900">{member.name}</span>
                    </div>

                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        isCompleted
                          ? 'bg-slate-900 text-white'
                          : totalCount > 0
                          ? 'bg-slate-100 text-slate-700 border border-slate-200'
                          : 'bg-slate-50 text-slate-400 border border-slate-200/60'
                      }`}
                    >
                      {isCompleted ? `완료 (${totalCount}/${targetCount})` : `미달 (${totalCount}/${targetCount})`}
                    </span>
                  </div>

                  {/* Monthly Attendance Days List */}
                  <div className="space-y-2 mb-3">
                    {activeMonths.map((mKey) => {
                      const daysVal = member.attendances[mKey] || '';
                      return (
                        <div
                          key={mKey}
                          onClick={() => handleCellClick(member.id, mKey, daysVal)}
                          className="flex items-center justify-between text-xs p-2 rounded-xl bg-slate-50 hover:bg-slate-100/80 cursor-pointer transition"
                        >
                          <span className="font-semibold text-slate-500">{mKey}</span>
                          <span className="font-bold text-slate-900 truncate max-w-[200px]">
                            {daysVal || <span className="text-slate-300 font-normal">참석 없음</span>}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Card Footer: Total Count & Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <div className="text-xs text-slate-500">
                    총 참석: <strong className="text-sm font-extrabold text-slate-900 ml-1">{totalCount}회</strong>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onEditMember(member)}
                      className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
                      title="수정"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`${member.name} 회원을 삭제하시겠습니까?`)) {
                          onDeleteMember(member.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition"
                      title="삭제"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {sortedMembers.length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200/80">
              크루원 데이터가 없습니다. 카톡 txt 대화록을 업로드해 주세요.
            </div>
          )}
        </div>
      )}

      {/* ---------------- TABLE VIEW (WITH STICKY LEFT COLUMN) ---------------- */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto -webkit-overflow-scrolling-touch">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/90 text-slate-600 font-bold border-b border-slate-200/80">
                  <th className="py-3.5 px-3 text-center border-r border-slate-200/60 w-10 text-slate-400">#</th>
                  
                  {/* Sticky Name Header Column */}
                  <th className="py-3.5 px-4 border-r border-slate-200/80 text-slate-900 sticky left-0 bg-slate-100 z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.08)] min-w-[90px]">
                    이름
                  </th>

                  {selectedMonth === '전체' ? (
                    months.map((m) => (
                      <th key={m} className="py-3.5 px-4 border-r border-slate-200/60 min-w-[150px]">
                        {m}
                      </th>
                    ))
                  ) : (
                    <th className="py-3.5 px-4 border-r border-slate-200/60 min-w-[220px]">
                      {selectedMonth} 출석 일자
                    </th>
                  )}

                  <th className="py-3.5 px-4 border-r border-slate-200/60 text-center font-extrabold text-slate-900 w-20 bg-slate-100/60">
                    합계
                  </th>
                  <th className="py-3.5 px-4 border-r border-slate-200/60 text-center min-w-[100px]">달성 상태</th>
                  <th className="py-3.5 px-3 text-center w-16 text-slate-400">관리</th>
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

                      {/* Sticky Body Name Cell */}
                      <td className="py-3 px-4 font-extrabold text-slate-900 border-r border-slate-200/80 sticky left-0 bg-white group-hover:bg-slate-50 transition-colors z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.06)]">
                        {member.name}
                      </td>

                      {/* Monthly Attendance */}
                      {selectedMonth === '전체' ? (
                        months.map((mKey) => {
                          const daysValue = member.attendances[mKey] || '';
                          const isEditing = editingCell?.memberId === member.id && editingCell?.month === mKey;

                          return (
                            <td
                              key={mKey}
                              onClick={() => !isEditing && handleCellClick(member.id, mKey, daysValue)}
                              className="py-3 px-4 border-r border-slate-100 cursor-pointer hover:bg-slate-100/60 transition text-slate-700"
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
                                  <Edit2 className="w-3 h-3 text-slate-400 opacity-0 group-hover/cell:opacity-100 transition" />
                                </div>
                              )}
                            </td>
                          );
                        })
                      ) : (
                        <td
                          onClick={() => handleCellClick(member.id, selectedMonth, member.attendances[selectedMonth] || '')}
                          className="py-3 px-4 border-r border-slate-100 cursor-pointer hover:bg-slate-100/60 transition text-slate-700"
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
                              <Edit2 className="w-3 h-3 text-slate-400 opacity-0 group-hover/cell:opacity-100 transition" />
                            </div>
                          )}
                        </td>
                      )}

                      {/* Total Count */}
                      <td className="py-3 px-4 text-center font-extrabold text-slate-900 border-r border-slate-100 bg-slate-50/50 text-sm">
                        {totalCount}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 border-r border-slate-100 text-center">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                            isCompleted
                              ? 'bg-slate-900 text-white'
                              : totalCount > 0
                              ? 'bg-slate-100 text-slate-700 border border-slate-200'
                              : 'bg-slate-50 text-slate-400 border border-slate-200/60'
                          }`}
                        >
                          {isCompleted ? `완료 (${totalCount}/${targetCount})` : `미달 (${totalCount}/${targetCount})`}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-1.5 opacity-60 group-hover:opacity-100">
                          <button
                            onClick={() => onEditMember(member)}
                            className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded transition"
                            title="수정"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`${member.name} 회원을 삭제하시겠습니까?`)) {
                                onDeleteMember(member.id);
                              }
                            }}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded transition"
                            title="삭제"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
