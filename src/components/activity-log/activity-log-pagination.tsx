"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"

interface ActivityLogPaginationProps {
  pageIndex: number
  isDone: boolean
  isLoading: boolean
  onPrevious: () => void
  onNext: () => void
}

export function ActivityLogPagination({
  pageIndex,
  isDone,
  isLoading,
  onPrevious,
  onNext,
}: ActivityLogPaginationProps) {
  return (
    <div className="flex items-center justify-end space-x-2 py-4">
      <Button
        variant="outline"
        size="sm"
        onClick={onPrevious}
        disabled={pageIndex === 0 || isLoading}
      >
        Previous
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={onNext}
        disabled={isDone || isLoading}
      >
        Next
      </Button>
    </div>
  )
}
