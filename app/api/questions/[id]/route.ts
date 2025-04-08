import { NextResponse } from 'next/server';
import { db } from '@/firebase/admin';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    if (!params.id) {
      return NextResponse.json(
        { error: 'Question ID is required' },
        { status: 400 }
      );
    }

    const questionDoc = await db.collection('assessmentQuestions').doc(params.id).get();

    if (!questionDoc.exists) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      );
    }

    // Get the data from the document
    const questionData = questionDoc.data();

    // Return the question data
    return NextResponse.json({
      success: true,
      data: {
        id: questionDoc.id,
        ...questionData
      }
    });
  } catch (error) {
    console.error('Error fetching question:', error);
    return NextResponse.json(
      { error: 'Failed to fetch question', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 