import { NextResponse } from 'next/server';
import { WebClient } from '@slack/web-api';
import { sanitizeForSlack } from '@/lib/utils';
import { getSlackBotToken, SUBGROUPS } from '@/lib/config';

interface RefundRequest {
  subgroup: string;
  name: string;
  bankName: string;
  accountNumber: string;
  memo?: string;
}

export async function POST(request: Request) {
  try {
    const body: RefundRequest = await request.json();
    const { subgroup, name, bankName, accountNumber, memo } = body;

    // Validate required fields
    if (!subgroup || !name.trim() || !bankName.trim() || !accountNumber.trim()) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate account number format (숫자만 허용)
    const accountOnly = accountNumber.replace(/-/g, '');
    if (!/^\d+$/.test(accountOnly)) {
      return NextResponse.json(
        { error: 'Invalid account number format. Use numbers only' },
        { status: 400 }
      );
    }

    // Get Slack token at runtime
    const slackBotToken = getSlackBotToken();

    // Validate Slack token
    if (!slackBotToken) {
      console.error('SLACK_BOT_TOKEN not configured');
      return NextResponse.json(
        { error: 'Slack configuration missing' },
        { status: 500 }
      );
    }

    // Validate subgroups configuration
    if (SUBGROUPS.length === 0) {
      return NextResponse.json(
        { error: 'No valid subgroups configured' },
        { status: 500 }
      );
    }

    const selectedSubgroup = SUBGROUPS.find(s => s.id === subgroup);
    if (!selectedSubgroup) {
      return NextResponse.json(
        { error: 'Invalid subgroup selected' },
        { status: 400 }
      );
    }

    // Initialize Slack client
    const slack = new WebClient(slackBotToken);

    // Sanitize user inputs
    const sanitizedName = sanitizeForSlack(name);
    const sanitizedBankName = sanitizeForSlack(bankName);
    const sanitizedAccountNumber = sanitizeForSlack(accountNumber);
    const sanitizedSubgroupName = sanitizeForSlack(selectedSubgroup.name);
    const sanitizedMemo = memo ? sanitizeForSlack(memo) : '';

    // Create Slack message blocks
    const blocks: any[] = [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: '🔔 AWSKRUG 환불 신청',
          emoji: true,
        },
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*소모임:*\n${sanitizedSubgroupName}`,
          },
          {
            type: 'mrkdwn',
            text: `*신청자 이름:*\n${sanitizedName}`,
          },
          {
            type: 'mrkdwn',
            text: `*은행이름:*\n${sanitizedBankName}`,
          },
          {
            type: 'mrkdwn',
            text: `*계좌번호:*\n${sanitizedAccountNumber}`,
          },
          {
            type: 'mrkdwn',
            text: `*신청일시:*\n${new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })}`,
          },
        ],
      },
    ];

    // Add memo section if provided
    if (sanitizedMemo && sanitizedMemo.trim()) {
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*메모:*\n${sanitizedMemo}`,
        },
      });
    }

    // Add footer blocks
    blocks.push(
      {
        type: 'divider',
      },
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: '담당자는 신청자에게 연락하여 환불을 진행해주세요.',
          },
        ],
      }
    );

    // Create Slack message
    const message = {
      channel: selectedSubgroup.channelId,
      text: `새로운 환불 신청이 접수되었습니다.`,
      blocks,
    };

    // Send message to Slack
    const result = await slack.chat.postMessage(message);

    if (!result.ok) {
      console.error('Slack API error:', result);
      return NextResponse.json(
        { error: 'Failed to send Slack message' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Refund request submitted successfully',
    });

  } catch (error) {
    console.error('Error processing refund request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
