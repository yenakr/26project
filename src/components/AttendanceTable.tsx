import React, { useState } from 'react';
import {
  Search,
  Filter,
  Plus,
  Download,
  Upload,
  RotateCcw,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ChevronDown,
  Info
} from 'lucide-react';
import { Member, MemberTier } from '../types/attendance';
import {
  calculateSemesterTotal,
  getStatusBadgeInfo,
  getTierColorClass,
  getTierBadge,
  parseDaysCount
} from '../utils/helpers';
import { exportToExcel } from '../utils/exportExcel';

interface AttendanceTableProps {
  members: Member[];
  onEditMember: (member: Member) => void;
  onAddMember: () => void;
  onDeleteMember: (id: string) => void;
  onOpenUploader: () => void;
  onResetData: () => void;
  onUpdateDays: (memberId: string, month: string, newDays: string) => void;
}

export function AttendanceTable({
  members,
  onEditMember,
  onAddMember,
  onDeleteMember,
  onOpenUploader,
  onResetData,
  onUpdateDays
}: AttendanceTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [tierFilter, setTierFilter] = useState<string>('전체');
  const [statusFilter, setStatusFilter] = useState<string>('전체');
  const [editingCell, setEditingCell] = useState<{ memberId: string; month: string } | null>(null);
  const [cellValue, setCellValue] = useState('');

  const months = ['26.9', '26.10', '26.11', '26.12'];

  // Filter members
  const filteredMembers = members.filter((m) => {
    // Search name filter
    if (searchTerm && !m.name.includes(searchTerm)) return false;

    // Tier filter
    if (tierFilter !== '전체') {
      if (tierFilter === '신입' && m.tier !== '신입') return false;
      if (tierFilter === '정회원' && m.tier !== '정회원_1' && m.tier !== '정회원_2') return false;
      if (tierFilter === 'OB' && m.tier !== 'OB') return false;
    }

    // Status filter
    if (statusFilter !== '전체') {
      const status = getStatusBadgeInfo(m).type;
      if (statusFilter === '충족' && status !== '충족') return false;
      if (statusFilter === '진행중' && status !== '진행중') return false;
      if (statusFilter === '미달' && status !== '미달') return false;
      if (statusFilter === '비활동' && !m.inactiveStatus) return false;
    }

    return true;
  });

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
      {/* Controls Header */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        
        {/* Search & Filters */}
        <div className="flex flex-wrap items-center gap-2 flex-1">
          {/* Search */}
          <div className="relative min-w-[180px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="이름 검색..."
              className="w-full pl-9 pr-3 py-2 text-xs border rounded-xl focus:ring-2 focus:ring-blue-200 outline-none"
            />
          </div>

          {/* Tier Filter */}
          <select
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value)}
            className="px-3 py-2 text-xs border rounded-xl focus:ring-2 focus:ring-blue-200 outline-none bg-white text-gray-700 font-medium"
          >
            <option value="전체">전체 등급</option>
            <option value="신입">🟩 신입회원</option>
            <option value="정회원">🟦 정회원 (1~2학기)</option>
            <option value="OB">🟥 OB 회원 (3학기 이상)</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs border rounded-xl focus:ring-2 focus:ring-blue-200 outline-none bg-white text-gray-700 font-medium"
          >
            <option value="전체">전체 상태</option>
            <option value="충족">🟢 충족 (목표 달성)</option>
            <option value="진행중">🟡 진행중</option>
            <option value="미달">🔴 미달</option>
            <option value="비활동">⚪ 비활동 (휴학 등)</option>
          </select>

          <span className="text-xs text-gray-400 font-medium ml-1">
            검색 결과: <strong className="text-blue-600">{filteredMembers.length}</strong>명
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onOpenUploader}
            className="px-3.5 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-semibold rounded-xl border border-blue-200 flex items-center gap-1.5 transition"
          >
            <Upload className="w-3.5 h-3.5" />
            카톡 txt 파싱
          </button>

          <button
            onClick={() => exportToExcel(filteredMembers)}
            className="px-3.5 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-semibold rounded-xl border border-emerald-200 flex items-center gap-1.5 transition"
          >
            <Download className="w-3.5 h-3.5" />
            엑셀 다운로드 (xlsx)
          </button>

          <button
            onClick={onAddMember}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-sm flex items-center gap-1.5 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            회원 추가
          </button>

          <button
            onClick={onResetData}
            title="기본 명단으로 초기화"
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Table Grid */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-gray-100/80 text-gray-700 font-bold border-b border-gray-200">
                <th className="py-3 px-3 text-center border-r w-10">No</th>
                <th className="py-3 px-3 border-r min-w-[90px]">이름</th>
                <th className="py-3 px-3 border-r text-center w-20">학기 수</th>
                <th className="py-3 px-3 border-r min-w-[200px]">
                  26.9 <span className="font-normal text-gray-400">(9월)</span>
                </th>
                <th className="py-3 px-3 border-r min-w-[140px]">
                  26.10 <span className="font-normal text-gray-400">(10월)</span>
                </th>
                <th className="py-3 px-3 border-r min-w-[140px]">
                  26.11 <span className="font-normal text-gray-400">(11월)</span>
                </th>
                <th className="py-3 px-3 border-r min-w-[140px]">
                  26.12 <span className="font-normal text-gray-400">(12월)</span>
                </th>
                <th className="py-3 px-3 border-r text-center font-extrabold text-blue-700 w-16 bg-blue-50/50">
                  합계
                </th>
                <th className="py-3 px-3 border-r text-center min-w-[110px]">유지 조건</th>
                <th className="py-3 px-3 border-r text-center min-w-[90px]">비활동 여부</th>
                <th className="py-3 px-3 border-r min-w-[120px]">보증금 / 비고</th>
                <th className="py-3 px-2 text-center w-16">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200/70">
              {filteredMembers.map((member, index) => {
                const tierColor = getTierColorClass(member.tier);
                const statusInfo = getStatusBadgeInfo(member);
                const totalCount = calculateSemesterTotal(member.attendances);

                return (
                  <tr key={member.id} className={`${tierColor} transition-colors group`}>
                    {/* Index */}
                    <td className="py-2.5 px-3 text-center text-gray-400 border-r text-[11px]">
                      {index + 1}
                    </td>

                    {/* Name */}
                    <td className="py-2.5 px-3 font-semibold text-gray-900 border-r">
                      <div className="flex items-center justify-between">
                        <span>{member.name}</span>
                        {member.tier === '신입' && (
                          <span className="text-[10px] bg-emerald-600 text-white px-1.5 py-0.2 rounded font-normal">
                            신입
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Semester Count */}
                    <td className="py-2.5 px-3 text-center font-medium border-r text-gray-700">
                      {member.semesterCount || (member.tier === '신입' ? '' : '1')}
                    </td>

                    {/* Monthly Attendance Days (26.9, 26.10, 26.11, 26.12) */}
                    {months.map((mKey) => {
                      const daysValue = member.attendances[mKey] || '';
                      const isEditing =
                        editingCell?.memberId === member.id && editingCell?.month === mKey;

                      return (
                        <td
                          key={mKey}
                          onClick={() => !isEditing && handleCellClick(member.id, mKey, daysValue)}
                          className="py-2.5 px-3 border-r cursor-pointer hover:bg-white/80 transition relative text-gray-800"
                        >
                          {isEditing ? (
                            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                              <input
                                type="text"
                                value={cellValue}
                                onChange={(e) => setCellValue(e.target.value)}
                                placeholder="예: 4, 8, 15"
                                className="w-full px-2 py-1 border rounded text-xs focus:ring-2 focus:ring-blue-300 outline-none"
                                autoFocus
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleCellSave();
                                  if (e.key === 'Escape') setEditingCell(null);
                                }}
                              />
                              <button
                                onClick={handleCellSave}
                                className="px-2 py-1 bg-blue-600 text-white text-[11px] font-bold rounded"
                              >
                                저장
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between group/cell">
                              <span className="truncate max-w-[180px]">
                                {daysValue || <span className="text-gray-300 font-light">-</span>}
                              </span>
                              <Edit2 className="w-3 h-3 text-gray-400 opacity-0 group-hover/cell:opacity-100 transition" />
                            </div>
                          )}
                        </td>
                      );
                    })}

                    {/* Total Count */}
                    <td className="py-2.5 px-3 text-center font-extrabold text-blue-900 border-r bg-blue-50/30 text-sm">
                      {totalCount}
                    </td>

                    {/* Status Badge */}
                    <td className="py-2.5 px-3 border-r text-center">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[11px] border shadow-2xs ${statusInfo.colorClass}`}
                      >
                        {statusInfo.label}
                      </span>
                    </td>

                    {/* Inactive Status */}
                    <td className="py-2.5 px-3 border-r text-center text-gray-700 font-medium">
                      {member.inactiveStatus ? (
                        <span className="bg-gray-200/80 text-gray-700 px-2 py-0.5 rounded text-[11px]">
                          {member.inactiveStatus}
                        </span>
                      ) : (
                        <span className="text-gray-300 font-light">-</span>
                      )}
                    </td>

                    {/* Notes / Penalty */}
                    <td className="py-2.5 px-3 border-r text-gray-600">
                      {member.note ? (
                        <span className="text-rose-700 font-semibold bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                          {member.note}
                        </span>
                      ) : (
                        <span className="text-gray-300 font-light">-</span>
                      )}
                    </td>

                    {/* Edit/Delete Actions */}
                    <td className="py-2.5 px-2 text-center">
                      <div className="flex items-center justify-center gap-1 opacity-80 group-hover:opacity-100">
                        <button
                          onClick={() => onEditMember(member)}
                          title="회원 정보 수정"
                          className="p-1 text-gray-500 hover:text-blue-600 hover:bg-white rounded transition"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`${member.name} 회원을 삭제하시겠습니까?`)) {
                              onDeleteMember(member.id);
                            }
                          }}
                          title="삭제"
                          className="p-1 text-gray-400 hover:text-rose-600 hover:bg-white rounded transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredMembers.length === 0 && (
                <tr>
                  <td colSpan={12} className="py-12 text-center text-gray-400">
                    검색 조건에 해당되는 크루원이 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Excel Color Legend Footer */}
        <div className="bg-gray-50 border-t p-3 text-xs text-gray-600 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="font-bold text-gray-700 flex items-center gap-1">
              <Info className="w-4 h-4 text-blue-500" /> 회원 등급 표기 범주 (공지 엑셀 동일 기준):
            </span>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded bg-[#d9f2d9] border border-emerald-300 inline-block" />
              <span>신입회원 (유지: <strong>4회 이상</strong>)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded bg-[#dbeafe] border border-blue-300 inline-block" />
              <span>정회원: 1~2학기 (유지: <strong>4회 이상</strong>)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded bg-[#fce7f3] border border-rose-300 inline-block" />
              <span>OB 회원: 3학기 이상 (유지: <strong>2회 이상</strong>)</span>
            </div>
          </div>

          <div className="text-gray-400 text-[11px]">
            * 셀을 클릭하면 참석 날짜를 즉시 수정할 수 있습니다.
          </div>
        </div>
      </div>
    </div>
  );
}
