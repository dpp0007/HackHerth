"""
Test script for Conversation Closer feature
Run this to verify the feature works correctly
"""

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from conversation_closer import ConversationCloser


def test_closure_detection():
    """Test closure phrase detection."""
    print("🧪 Testing closure detection...")
    
    closer = ConversationCloser()
    
    # Test positive cases
    positive_cases = [
        "thank you",
        "thanks",
        "done",
        "got it",
        "okay thanks",
        "bye",
        "that's all",
        "appreciate it"
    ]
    
    for phrase in positive_cases:
        result = closer.detect_closure(phrase)
        status = "✅" if result else "❌"
        print(f"  {status} '{phrase}' -> {result}")
        assert result, f"Should detect '{phrase}' as closure"
    
    # Test negative cases
    negative_cases = [
        "hello",
        "how are you",
        "I'm feeling anxious",
        "what should I eat"
    ]
    
    for phrase in negative_cases:
        result = closer.detect_closure(phrase)
        status = "✅" if not result else "❌"
        print(f"  {status} '{phrase}' -> {result}")
        assert not result, f"Should NOT detect '{phrase}' as closure"
    
    print("✅ Closure detection tests passed!\n")


def test_task_selection():
    """Test context-aware task selection."""
    print("🧪 Testing task selection...")
    
    closer = ConversationCloser()
    
    # Test emotional state: anxious -> breathing
    task = closer.select_task(
        emotional_state="anxious",
        symptoms=[],
        fatigue_level="okay",
        pregnancy_week=24
    )
    print(f"  Anxious -> {task}")
    assert "breath" in task.lower(), "Should select breathing task for anxiety"
    
    # Test fatigue: exhausted -> rest
    task = closer.select_task(
        emotional_state="happy",
        symptoms=[],
        fatigue_level="exhausted",
        pregnancy_week=24
    )
    print(f"  Exhausted -> {task}")
    assert "rest" in task.lower() or "lie" in task.lower(), "Should select rest task for exhaustion"
    
    # Test symptom: nausea -> nutrition
    task = closer.select_task(
        emotional_state="okay",
        symptoms=[{"symptom": "nausea"}],
        fatigue_level="okay",
        pregnancy_week=24
    )
    print(f"  Nausea -> {task}")
    assert "eat" in task.lower() or "food" in task.lower() or "snack" in task.lower(), "Should select nutrition task for nausea"
    
    # Test default: hydration
    task = closer.select_task(
        emotional_state=None,
        symptoms=[],
        fatigue_level=None,
        pregnancy_week=None
    )
    print(f"  Default -> {task}")
    assert "water" in task.lower(), "Should default to hydration task"
    
    print("✅ Task selection tests passed!\n")


def test_confirmation_formatting():
    """Test confirmation message formatting."""
    print("🧪 Testing confirmation formatting...")
    
    closer = ConversationCloser()
    
    # Test successful sync
    task = "Drink one glass of water now"
    confirmation = closer.format_confirmation(task, todoist_success=True)
    print(f"  Success format:\n{confirmation}\n")
    assert "Todoist" in confirmation
    assert task in confirmation
    assert "💗" in confirmation
    
    # Test failed sync
    confirmation = closer.format_confirmation(task, todoist_success=False)
    print(f"  Failure format:\n{confirmation}\n")
    assert "wasn't able to sync" in confirmation
    assert task in confirmation
    assert "💗" in confirmation
    
    print("✅ Confirmation formatting tests passed!\n")


def test_task_variety():
    """Test that tasks don't repeat."""
    print("🧪 Testing task variety...")
    
    closer = ConversationCloser()
    
    tasks = []
    for i in range(10):
        task = closer.select_task(
            emotional_state="happy",
            symptoms=[],
            fatigue_level="okay",
            pregnancy_week=24
        )
        tasks.append(task)
    
    unique_tasks = set(tasks)
    print(f"  Generated {len(tasks)} tasks, {len(unique_tasks)} unique")
    
    # Should have some variety (at least 3 different tasks in 10 attempts)
    assert len(unique_tasks) >= 3, "Should generate variety in tasks"
    
    print("✅ Task variety test passed!\n")


def test_log_entry_creation():
    """Test log entry creation."""
    print("🧪 Testing log entry creation...")
    
    closer = ConversationCloser()
    
    task = "Take 5 slow deep breaths"
    trigger = "thank you"
    context = {
        "emotional_state": "anxious",
        "symptoms": [],
        "fatigue_level": "okay",
        "pregnancy_week": 24
    }
    
    log_entry = closer.create_task_log_entry(
        task=task,
        todoist_success=True,
        trigger_phrase=trigger,
        context=context
    )
    
    print(f"  Log entry: {log_entry}")
    
    assert "timestamp" in log_entry
    assert log_entry["task"] == task
    assert log_entry["trigger_phrase"] == trigger
    assert log_entry["todoist_synced"] == True
    assert log_entry["context"] == context
    
    print("✅ Log entry creation test passed!\n")


def test_stats():
    """Test statistics tracking."""
    print("🧪 Testing statistics...")
    
    closer = ConversationCloser()
    
    # Initial stats
    stats = closer.get_stats()
    print(f"  Initial stats: {stats}")
    assert stats["total_assignments"] == 0
    
    # Assign some tasks
    for i in range(3):
        closer.select_task()
    
    # Check updated stats
    stats = closer.get_stats()
    print(f"  After 3 assignments: {stats}")
    assert stats["total_assignments"] == 3
    assert stats["last_task"] is not None
    
    print("✅ Statistics test passed!\n")


def run_all_tests():
    """Run all tests."""
    print("=" * 60)
    print("🚀 Running Conversation Closer Tests")
    print("=" * 60 + "\n")
    
    try:
        test_closure_detection()
        test_task_selection()
        test_confirmation_formatting()
        test_task_variety()
        test_log_entry_creation()
        test_stats()
        
        print("=" * 60)
        print("✅ ALL TESTS PASSED!")
        print("=" * 60)
        print("\n🎉 Conversation Closer feature is working correctly!")
        print("\nNext steps:")
        print("1. Start the agent: python src/agent.py")
        print("2. Have a conversation")
        print("3. Say 'thank you' to trigger task assignment")
        print("4. Check pregnancy_data/closure_tasks.json")
        print("5. Check Todoist for the new task")
        
    except AssertionError as e:
        print(f"\n❌ TEST FAILED: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    run_all_tests()
