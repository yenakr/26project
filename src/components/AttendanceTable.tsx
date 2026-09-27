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
  Filter
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
      {/* Action Controls Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        
        {/* Search, Period & Sort */}
        <div className="flex flex-wrap items-center gap-2 flex-1">
          {/* Search Input */}
          <div className="relative min-w-[160px]">
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
          <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200/80">
            <span className="text-[11px] text-slate-400 font-medium px-2 flex items-center gap-1">
              <Filter className="w-3 h-3 text-slate-400" /> 기간:
            </span>
            <button
              onClick={() => setSelectedMonth('전체')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition ${
                selectedMonth === '전체' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              전체 학기
            </button>
            {months.map((m) => (
              <button
                key={m}
                onClick={() => setSelectedMonth(m)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition ${
                  selectedMonth === m ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-1">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as SortOption)}
              className="px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-slate-900 outline-none bg-white text-slate-700 font-semibold cursor-pointer"
            >
              <option value="name_asc">가나다순</option>
              <option value="count_desc">출석 많은 순</option>
              <option value="count_asc">출석 적은 순</option>
              <option value="completed">완료 기준 (4회 이상)</option>
              <option value="pending">미달 기준 (4회 미만)</option>
            </select>
          </div>
        </div>

        {/* Top Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onOpenRosterImport}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl border border-slate-200/80 flex items-center gap-1.5 transition"
          >
            <UserPlus className="w-3.5 h-3.5 text-slate-600" />
            전체 명단 불러오기
          </button>

          <button
            onClick={onOpenUploader}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl border border-slate-200/80 flex items-center gap-1.5 transition"
          >
            <Upload className="w-3.5 h-3.5 text-slate-600" />
            카톡 txt 불러오기
          </button>

          <button
            onClick={() => exportToExcel(sortedMembers, activeMonths)}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-xs flex items-center gap-1.5 transition"
          >
            <Download className="w-3.5 h-3.5" />
            엑셀 다운로드
          </button>

          <button
            onClick={onAddMember}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl border border-slate-200 transition"
            title="회원 수동 추가"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 text-slate-600 font-bold border-b border-slate-200/80">
                <th className="py-3.5 px-4 text-center border-r border-slate-200/60 w-12 text-slate-400">#</th>
                <th className="py-3.5 px-4 border-r border-slate-200/60 min-w-[100px] text-slate-900">이름</th>
                
                {selectedMonth === '전체' ? (
                  months.map((m) => (
                    <th key={m} className="py-3.5 px-4 border-r border-slate-200/60 min-w-[160px]">
                      {m}
                    </th>
                  ))
                ) : (
                  <th className="py-3.5 px-4 border-r border-slate-200/60 min-w-[240px]">
                    {selectedMonth} 출석 날짜
                  </th>
                )}

                <th className="py-3.5 px-4 border-r border-slate-200/60 text-center font-extrabold text-slate-900 w-20 bg-slate-100/50">
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
                    <td className="py-3 px-4 text-center text-slate-400 border-r border-slate-100 text-[11px]">
                      {index + 1}
                    </td>

                    <td className="py-3 px-4 font-bold text-slate-900 border-r border-slate-100">
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
                            if (confirm(`${member.name} 회원을 목록에서 삭제하시겠습니까?`)) {
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

              {sortedMembers.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    크루원 데이터가 없습니다. 카톡 txt 대화록을 업로드하거나 명단을 추가해 주세요.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
